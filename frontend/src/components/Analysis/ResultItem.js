import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { getProcessingMethods } from '../../selectors/data';
import {
  makeStyles,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Popover,
  IconButton,
} from '@material-ui/core';
import ConfigIcon from '@material-ui/icons/Settings';
import MaterialTable from 'material-table';
import Plot from 'react-plotly.js';
import { ANALYSIS_RESULT_STOP_POLLING, ANALYSIS_RESULT_START_POLLING } from '../../constants/ActionTypes';
import { PROCESS_STATUS } from '../Common/StatusIcon';
import { useJoinedResults } from './hooks';

const useStyles = makeStyles(theme => ({
  plot: {
    userSelect: 'none',
    width: '100%',
    maxHeight: '40vh',
  },
  popover: {
    padding: theme.spacing(1),
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
  const [anchorEl, setAnchorEl] = useState(null);
  const popoverOpen = Boolean(anchorEl);

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

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

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
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6'>{method.name}</Typography>
          { results[0] &&
            <IconButton
              aria-owns={popoverOpen ? 'config-popover' : undefined}
              aria-haspopup='true'
              size='small'
              onClick={handlePopoverOpen}
            >
              <ConfigIcon />
            </IconButton>
          }
        </Box>
        <Grid container spacing={1}>
          {renderSpinner()}
          {renderTable()}
          {plots.map(renderPlot)}
        </Grid>
      </CardContent>
      {/* <Popover
        id='config-popover'
        classes={{
          paper: classes.popover,
        }}
        open={popoverOpen}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        {Object.entries(results[0].configuration).map(([key, value]) => <Typography>{key}: {String(value)}</Typography>)}
      </Popover> */}
    </Card>
  );
}
