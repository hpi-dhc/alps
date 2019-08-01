import React, { useCallback, useState } from 'react';
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
import ZoomOutIcon from '@material-ui/icons/ZoomOutMap';
import YAxisToggleIcon from '@material-ui/icons/UnfoldMore';
import DotsToggleIcon from '@material-ui/icons/FiberManualRecord';

import SignalPlot from './Plot';
import { useSignalSamples } from '../../api/signals';
import { setDomain } from '../../actions/preprocess';
import { getSources, getAnalysisSamplesArrayBySession } from '../../selectors/data';

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
  tagSignal: PropTypes.string,
  plot: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
  plotProps: PropTypes.object,
};

SignalCard.defaultProps = {
  datasets: {},
  signals: {},
};

function SignalCard ({ datasets, signals, onChange, onClose, plot, tagSignal, plotProps, ...rest }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const sources = useSelector(getSources);
  const analysisSamples = useSelector(state => getAnalysisSamplesArrayBySession(state)[plot.session]);
  const domainY = plot.signal ? [signals[plot.signal].y_min, signals[plot.signal].y_max] : undefined;
  const [ isDomainYAuto, setDomainYAuto ] = useState(true);
  const [ showDots, setShowDots ] = useState(false);

  const { data: signal, isError, isLoading } = useSignalSamples(plot.signal, plotProps.domainX);
  const { data: { data: tags } } = useSignalSamples(tagSignal, plotProps.domainX);

  const getSourceName = (dataset) => {
    const source = sources[dataset.source];
    return source ? source.name : 'Raw files';
  };

  const handleZoomOut = useCallback(() => {
    const signal = signals[plot.signal];
    const domainX = [new Date(signal.first_timestamp).valueOf(), new Date(signal.last_timestamp).valueOf()];
    dispatch(setDomain(plot.session, domainX));
  }, [dispatch, plot, signals]);

  const handlePanEnd = useCallback(({ domainX }) => {
    dispatch(setDomain(plot.session, domainX));
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
      filteredSignals = dataset.signals.reduce((array, each) => {
        if (signals[each]) {
          array.push(signals[each]);
        }
        return array;
      }, []);
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
        { signal.resampling && <Typography variant='caption' color='textSecondary'>Resampled ({signal.resampling})</Typography> }
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
          disabled={!signal.data}
        >
          <ZoomOutIcon fontSize='inherit' />
        </IconButton>
        { onClose &&
          <IconButton
            size='small'
            onClick={() => onClose(plot.id)}
            title='Close plot'
          >
            <CloseIcon fontSize='inherit' />
          </IconButton>
        }
      </CardActions>
      <CardContent className={classes.contentArea}>
        <SignalPlot
          data={plot.signal ? signal.data : null}
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
