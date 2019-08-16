import React, { useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import DataFrame from 'dataframe-js';
import { getProcessingMethods, getAllSignals, getDatasets } from '../../selectors/data';
import {
  makeStyles,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  CircularProgress,
} from '@material-ui/core';
import MaterialTable from 'material-table';
import Plot from 'react-plotly.js';
import { ANALYSIS_RESULT_STOP_POLLING, ANALYSIS_RESULT_START_POLLING } from '../../constants/ActionTypes';
import { PROCESS_STATUS } from '../Common/StatusIcon';

const useStyles = makeStyles(theme => ({
  plot: {
    userSelect: 'none',
    width: '100%',
    maxHeight: '40vh',
  },
}));

AnalysisResultItem.propTypes = {
  results: PropTypes.array.isRequired,
  method: PropTypes.string.isRequired,
};

AnalysisResultItem.defaultProps = {
  results: [],
};

export default function AnalysisResultItem ({ results, method: methodId, ...props }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const method = useSelector(getProcessingMethods)[methodId];
  const [columns, tableData, plots, isProcessing] = useJoinedResults(results);

  // start polling results, that are unprocessed or queued
  useEffect(() => {
    const polling = results.reduce((arr, each) => {
      if ([PROCESS_STATUS.QUEUED, PROCESS_STATUS.PROCESSING].includes(each.status)) {
        dispatch({ type: ANALYSIS_RESULT_START_POLLING, id: each.id });
        return [...arr, each.id];
      }
      return arr;
    }, []);

    return () => {
      polling.forEach(id => dispatch({ type: ANALYSIS_RESULT_STOP_POLLING, id }));
    };
  }, [dispatch, results]);

  const renderTable = () => {
    if (isProcessing) {
      return undefined;
    }

    const width = results.length > 1 ? 12 : 6;

    return (
      <Grid key={'table-' + methodId} item xs={12} lg={width}>
        <MaterialTable
          columns={columns}
          data={tableData}
          onRowClick={() => {}} // hack to get hover effect
          components={{
            // eslint-disable-next-line react/prop-types
            Container: ({ children, ...props }) => <div {...props}>{children}</div>,
          }}
          options={{
            showTitle: false,
            toolbar: false,
            paging: false,
            padding: 'dense',
            rowStyle: {
              whiteSpace: 'nowrap',
            },
            headerStyle: {
              whiteSpace: 'nowrap',
            },
          }}
        />
      </Grid>
    );
  };

  const renderPlot = (plot, index) => {
    return (
      <Grid
        item
        key={`plot-${methodId}-${index}`}
        xs={12}
        lg={6}
      >
        <Plot
          {...plot}
          config={{
            displaylogo: false,
          }}
          className={classes.plot}
          useResizeHandler
        />
      </Grid>
    );
  };

  const renderSpinner = () => {
    if (!isProcessing) {
      return undefined;
    }

    return (
      <Grid item xs={12}>
        <CircularProgress />
      </Grid>
    );
  };

  return (
    <Card {...props}>
      <CardContent>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h6'>{method.name}</Typography>
        </Box>
        <Grid container spacing={1}>
          {renderSpinner()}
          {renderTable()}
          {plots.map(renderPlot)}
        </Grid>
      </CardContent>
    </Card>
  );
}

function useJoinedResults (results) {
  const datasets = useSelector(getDatasets);
  const signals = useSelector(getAllSignals);
  const isProcessing = results.some(each => [PROCESS_STATUS.QUEUED, PROCESS_STATUS.PROCESSING].includes(each.status));
  const isError = results.some(each => each.status === PROCESS_STATUS.ERROR);
  const doNotProcess = !results.length || isProcessing || isError;

  const getSuffix = useCallback((signal) => {
    return `${signals[signal].name} / ${datasets[signals[signal].dataset].title}`;
  }, [datasets, signals]);

  const [columns, tableData] = useMemo(() => {
    if (doNotProcess) return [[], []];

    let [dataframe, ...rest] = results.map(({ signal, result }) => {
      const suffix = getSuffix(signal);
      let dataframe = new DataFrame(result.table.data, result.table.columns);

      if (results.length > 1) {
        dataframe = dataframe.renameAll(dataframe.listColumns().map((each) => {
          if (!['Variable', 'Unit'].includes(each)) {
            return `${each} (${suffix})`;
          }
          return each;
        }));
      }

      return dataframe;
    });

    for (let each of rest) {
      dataframe = dataframe.fullJoin(each, 'Variable');
    }

    if (rest.length > 0) {
      const hasUnits = dataframe.listColumns().includes('Unit');
      const units = hasUnits ? dataframe.toArray('Unit') : [];
      const columnNames = dataframe.toArray('Variable').map((each, index) => {
        if (units[index]) {
          return `${each} (${units[index]})`;
        } else {
          return each;
        }
      });
      dataframe = dataframe.transpose()
        .renameAll(columnNames)
        .slice(hasUnits ? 2 : 1)
        .withColumn('Signal', (_, index) => getSuffix(results[index].signal));
      dataframe = dataframe.restructure([
        'Signal',
        ...dataframe.listColumns().filter(each => each !== 'Signal'),
      ]);
    }

    const columns = dataframe.listColumns().map(each => ({ title: each, field: each }));
    return [columns, dataframe.toCollection()];
  }, [doNotProcess, getSuffix, results]);

  const plots = useMemo(() => {
    if (doNotProcess) return [];

    if (results.length === 1 && results[0].result) {
      return [results[0].result.plot];
    }

    return results.reduce((array, { signal, result }) => {
      if (!result || !result.plot) return array;

      const suffix = getSuffix(signal);
      return [...array, {
        ...result.plot,
        layout: {
          ...result.plot.layout,
          width: undefined,
          height: undefined,
          title: {
            ...result.plot.layout.title,
            text: `${result.plot.layout.title.text} (${suffix})`,
          },
        },
      }];
    }, []);
  }, [doNotProcess, getSuffix, results]);

  return [columns, tableData, plots, isProcessing];
};
