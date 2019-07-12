import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import {
  Card,
  CardContent,
  Select,
  MenuItem,
  CardActions,
  IconButton,
  makeStyles,
  LinearProgress,
  Tooltip,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import ErrorIcon from '@material-ui/icons/Error';
import ZoomOutIcon from '@material-ui/icons/ZoomOutMap';

import SignalPlot from './Plot';
import { useSignalSamples } from '../../api/signals';
import { setPlotDomain } from '../../actions/plots';

const useStyles = makeStyles(theme => ({
  actionArea: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  shiftButtons: {
    marginLeft: 'auto',
  },
  contentArea: {
    paddingTop: 0,
    paddingBottom: '0 !important',
  },
  progressBar: {
    height: 4,
    marginBottom: -4,
  },
}));

function SignalCard ({ datasets, signals, onChange, onClose, plot, plotProps, ...rest }) {
  const classes = useStyles();
  const dispatch = useDispatch();

  const { data, isError, isLoading } = useSignalSamples(plot.signal, plotProps.domainX);

  const getSourceName = (dataset) => {
    return dataset.source || 'Raw files';
  };

  const handleZoomOut = useCallback(() => {
    const signal = signals[plot.signal];
    const domain = [moment(signal.first_timestamp).valueOf(), moment(signal.last_timestamp).valueOf()];
    dispatch(setPlotDomain(plot.session, domain));
  }, [dispatch, plot, signals]);

  const renderDatasetSelection = () => {
    return (
      <Select
        value={plot.dataset}
        onChange={onChange}
        name={`dataset-${plot.id}`}
        displayEmpty
      >
        <MenuItem value='' disabled>Select dataset</MenuItem>
        {
          Object.values(datasets).map(
            each => <MenuItem key={each.id} value={each.id}>{each.title} ({getSourceName(each)})</MenuItem>
          )
        }
      </Select>
    );
  };

  const renderSignalSelection = () => {
    let filteredSignals = [];

    if (plot.dataset && datasets[plot.dataset]) {
      const dataset = datasets[plot.dataset];
      filteredSignals = dataset.signals.map(each => {
        return signals[each];
      });
    }

    return (
      <Select
        value={plot.signal}
        onChange={onChange}
        name={`signal-${plot.id}`}
        displayEmpty
        disabled={!plot.dataset}
      >
        <MenuItem value='' disabled>Select signal</MenuItem>
        {filteredSignals.map(
          each => <MenuItem key={each.id} value={each.id}>{each.name}</MenuItem>
        )}
      </Select>
    );
  };

  return (
    <Card {...rest} style={{ userSelect: 'none' }}>
      { isLoading && <LinearProgress className={classes.progressBar} /> }
      <CardActions className={classes.actionArea}>
        { renderDatasetSelection() }
        { renderSignalSelection() }
        { isError && <Tooltip title='Unable to load signal.'><ErrorIcon color='error' /></Tooltip> }
        <IconButton
          size='small'
          className={classes.shiftButtons}
          onClick={handleZoomOut}
          disabled={!data.length}
        >
          <ZoomOutIcon fontSize='inherit' />
        </IconButton>
        <IconButton size='small' onClick={() => onClose(plot.id)}>
          <CloseIcon fontSize='inherit' />
        </IconButton>
      </CardActions>
      <CardContent className={classes.contentArea}>
        <SignalPlot data={data} {...plotProps} />
      </CardContent>
    </Card>
  );
}

SignalCard.propTypes = {
  datasets: PropTypes.object,
  signals: PropTypes.object,
  plot: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
  plotProps: PropTypes.object,
};

SignalCard.defaultProps = {
  datasets: {},
  signals: {},
};

export default SignalCard;
