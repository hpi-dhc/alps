import React, { useCallback, useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
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
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import ZoomOutIcon from '@material-ui/icons/ZoomOutMap';
import YAxisToggleIcon from '@material-ui/icons/UnfoldMore';
import DotsToggleIcon from '@material-ui/icons/FiberManualRecord';

import SignalPlot from './Plot';
import { useSignalSamples } from '../../api/signals';
import { usePollingEffect } from '../Common/hooks';
import * as Plots from '../../actions/plots';
import { getSources, getAnalysisSamplesArrayBySession } from '../../selectors/data';
import { SIGNAL_STOP_POLLING, SIGNAL_START_POLLING } from '../../constants/ActionTypes';
import { useCompare } from '../../utils';

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

SignalCard.propTypes = {
  datasets: PropTypes.object,
  signals: PropTypes.object,
  plot: PropTypes.object.isRequired,
  tagSignal: PropTypes.string,
  closable: PropTypes.bool,
  plotProps: PropTypes.object,
};

SignalCard.defaultProps = {
  datasets: {},
  signals: {},
  closable: false,
};

function SignalCard ({ datasets, signals, plot, tagSignal, closable, plotProps, ...rest }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const sources = useSelector(getSources);
  const signal = signals[plot.signal];
  const analysisSamples = useSelector(state => getAnalysisSamplesArrayBySession(state)[plot.session]);
  const domainY = signal ? [signal.yMin, signal.yMax] : undefined;
  const [ isDomainYAuto, setDomainYAuto ] = useState(true);
  const [ showDots, setShowDots ] = useState(false);

  const filteredSignals = useMemo(() => {
    if (!plot.dataset || !datasets[plot.dataset]) return [];
    const dataset = datasets[plot.dataset];
    return dataset.signals.reduce((array, each) => {
      if (signals[each]) {
        array.push(signals[each]);
      }
      return array;
    }, []);
  }, [plot.dataset, datasets, signals]);

  // auto-select signal, if there is only one for the selected dataset
  useEffect(() => {
    if (filteredSignals.length === 1 && !plot.signal) {
      dispatch(Plots.upsert(plot.session, {
        id: plot.id,
        signal: filteredSignals[0].id,
      }));
    }
  }, [dispatch, filteredSignals, plot.id, plot.session, plot.signal]);

  const { isPolling } = usePollingEffect(signal, SIGNAL_START_POLLING, SIGNAL_STOP_POLLING);
  const isPollingChanged = useCompare(isPolling);
  const { data: samples, isError, isLoading, reload } = useSignalSamples(plot.signal, plotProps.domainX);
  const { data: { data: tags } } = useSignalSamples(tagSignal, plotProps.domainX);

  useEffect(() => {
    if (isPollingChanged && !isPolling && !isLoading) {
      reload();
    }
  }, [isLoading, isPolling, isPollingChanged, reload]);

  const getSourceName = (dataset) => {
    const source = sources[dataset.source];
    return source ? source.name : 'Raw files';
  };

  const handleClose = useCallback(() => {
    dispatch(Plots.destroy(plot.session, plot.id));
  }, [dispatch, plot]);

  const handleChangeDataset = useCallback((event) => {
    dispatch(Plots.upsert(plot.session, {
      id: plot.id,
      dataset: event.target.value,
      signal: '',
    }));
  }, [dispatch, plot]);

  const handleChangeSignal = useCallback((event) => {
    dispatch(Plots.upsert(plot.session, {
      id: plot.id,
      signal: event.target.value,
    }));
  }, [dispatch, plot]);

  const handleZoomOut = useCallback(() => {
    const domainX = [
      new Date(signal.firstTimestamp).valueOf(),
      new Date(signal.lastTimestamp).valueOf(),
    ];
    dispatch(Plots.setDomain(plot.session, domainX));
  }, [dispatch, plot, signal]);

  const handlePanEnd = useCallback(({ domainX }) => {
    dispatch(Plots.setDomain(plot.session, domainX));
  }, [dispatch, plot.session]);

  const toggleDomainY = () => {
    setDomainYAuto(prev => !prev);
  };

  const toggleDots = () => {
    setShowDots(prev => !prev);
  };

  const renderDatasetSelection = () => {
    return (
      <Select
        value={plot.dataset}
        onChange={handleChangeDataset}
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
    return (
      <Select
        value={plot.signal}
        onChange={handleChangeSignal}
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
      { (isLoading || isPolling) && <LinearProgress className={classes.progressBar} /> }
      <CardActions className={classes.actionArea}>
        { renderDatasetSelection() }
        { renderSignalSelection() }
        {
          signal && signal.process && signal.process.info &&
          <Tooltip title={signal.process.info}><InfoIcon color='inherit' /></Tooltip>
        }
        { isError && <Tooltip title='Unable to load signal.'><ErrorIcon color='error' /></Tooltip> }
        { samples.downsampled &&
          <Typography
            variant='caption'
            color='textSecondary'
            title={`Window size: ${samples.window} sec.`}
          >
            Downsampled
          </Typography>
        }
        <IconButton
          size='small'
          className={classes.shiftButtons}
          onClick={toggleDots}
          color={showDots ? 'secondary' : 'default'}
          title='Show datapoints'
        >
          <DotsToggleIcon fontSize='inherit' />
        </IconButton>
        <IconButton
          size='small'
          onClick={toggleDomainY}
          color={isDomainYAuto ? 'default' : 'secondary'}
          title='Set y axis to signal min and max'
        >
          <YAxisToggleIcon fontSize='inherit' />
        </IconButton>
        <IconButton
          size='small'
          onClick={handleZoomOut}
          title='Show complete signal'
          disabled={!samples.data}
        >
          <ZoomOutIcon fontSize='inherit' />
        </IconButton>
        { closable &&
          <IconButton
            size='small'
            onClick={handleClose}
            title='Close plot'
          >
            <CloseIcon fontSize='inherit' />
          </IconButton>
        }
      </CardActions>
      <CardContent className={classes.contentArea}>
        <SignalPlot
          data={signal ? samples.data : null}
          tags={tagSignal ? tags : []}
          analysisSamples={analysisSamples}
          showDots={showDots}
          domainY={isDomainYAuto ? undefined : domainY}
          yLabel={plot.signal && signals[plot.signal].unit}
          onPanEnd={handlePanEnd}
          {...plotProps}
        />
      </CardContent>
    </Card>
  );
}

export default SignalCard;
