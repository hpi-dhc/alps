import React, { useState, useEffect, useMemo } from 'react';
import PropTypes, { any } from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import DataFrame from 'dataframe-js';
import { getProcessingMethods, getAllSignals, getDatasets } from '../../selectors/data';
import {
  makeStyles,
  Card,
  CardActions,
  CardContent,
  Typography,
  FormControl,
  MenuItem,
  Select,
  Box,
  Grid,
  CircularProgress,
} from '@material-ui/core';
import MaterialTable from 'material-table';
import Plot from 'react-plotly.js';
import formatDate from 'date-fns/format';
import { ANALYSIS_RESULT_STOP_POLLING, ANALYSIS_RESULT_START_POLLING } from '../../constants/ActionTypes';
import { PROCESS_STATUS } from '../Common/StatusIcon';

const useStyles = makeStyles(theme => ({
  plot: {
    userSelect: 'none',
    width: '100%',
    height: '50vh',
  },
}));

AnalysisResultItem.propTypes = {
  results: PropTypes.array.isRequired,
  method: PropTypes.string.isRequired,
};

export default function AnalysisResultItem ({ results, method: methodId }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const method = useSelector(getProcessingMethods)[methodId];
  const signals = useSelector(getAllSignals);
  const datasets = useSelector(getDatasets);
  const [columns, tableData] = useMemo(() => {
    if (results.some(each => each.result === null)) {
      return [[], []];
    }

    let [dataframe, ...rest] = results.map(({ signal, result }) => {
      const suffix = datasets[signals[signal].dataset].title;
      return new DataFrame(result.table.data, result.table.columns)
        .rename('Value', `Value (${suffix})`);
    });
    for (let each of rest) {
      dataframe = dataframe.fullJoin(each, 'Variable');
    }

    const columns = dataframe.listColumns().map(each => ({ title: each, field: each }));
    return [columns, dataframe.toCollection()];
  }, [datasets, results, signals]);

  useEffect(() => {
    const pollingResults = results.reduce((arr, each) => {
      if ([PROCESS_STATUS.QUEUED, PROCESS_STATUS.PROCESSING].includes(each.status)) {
        dispatch({ type: ANALYSIS_RESULT_START_POLLING, id: each.id });
        return [...arr, each.id];
      }
      return arr;
    }, []);

    return () => {
      pollingResults.forEach(id => dispatch({ type: ANALYSIS_RESULT_STOP_POLLING, id }));
    };
  }, [dispatch, results]);

  const renderTable = () => {
    // const tableCols = results[0].result.plot ? 6 : 12;
    // const columns = table.columns.map(each => ({ title: each, field: each }));
    return (
      <Grid item xs={12}>
        <MaterialTable
          columns={columns}
          data={tableData}
          components={{
            // eslint-disable-next-line react/prop-types
            Container: ({ children, ...props }) => <div {...props}>{children}</div>,
          }}
          options={{
            showTitle: false,
            toolbar: false,
            paging: false,
            padding: 'dense',
          }}
        />
      </Grid>
    );
  };

  const renderPlot = (plot) => {
    if (!plot) {
      return undefined;
    }

    let layout = {
      width: undefined,
      height: undefined,
    };
    if (plot.layout) {
      layout = {
        ...plot.layout,
        ...layout,
      };
    }

    return (
      <Grid item xs={12} lg={6}>
        <Plot
          {...plot}
          className={classes.plot}
          layout={layout}
          config={{
            displaylogo: false,
          }}
          useResizeHandler
        />
      </Grid>
    );
  };

  const renderSpinner = () => {
    if (!results) return undefined;

    return (
      <Grid item xs={12}>
        <CircularProgress />
      </Grid>
    );
  };

  return (
    <Card>
      <CardContent>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h6'>{method.name}</Typography>
        </Box>
        <Grid container spacing={1}>
          {/* {renderSpinner()} */}
          {renderTable()}
          {/* {renderPlot(result.result.plot)} */}
        </Grid>
      </CardContent>
    </Card>
  );
}
