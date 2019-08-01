import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import uuid from 'uuid/v4';

import { Container, Fab, Grid, Box } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import SignalCard from '../components/Signal/Card';
import { filterObjectByValue } from '../utils';

import { getSessions, getSignals, getDatasets, getIBISignals } from '../selectors/data';
import { getItems } from '../selectors/preprocess';
import { upsertPlot, deletePlot, setDomain } from '../actions/preprocess';
import * as Sessions from '../actions/sessions';
import * as AnalysisSamples from '../actions/analysisSamples';
import * as plotModes from '../constants/PlotModes';
import AnalysisSampleDialog from '../components/AnalysisSample/Dialog';

function SessionPreprocess ({ match }) {
  const sessionId = match.params.sessionId;
  const session = useSelector(getSessions)[sessionId];
  const datasets = useSelector((state) => {
    const allDatasets = getDatasets(state);
    return filterObjectByValue(allDatasets, each => each.session === sessionId);
  });
  const signals = useSelector(getSignals);
  const ibiSignals = useSelector(getIBISignals);
  const preprocess = useSelector((state) => getItems(state)[sessionId]);
  const [isSampleDialogOpen, setSampleDialogOpen] = useState(false);
  const [markedArea, setMarkedArea] = useState([null, null]);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(Sessions.get(sessionId));
  }, [dispatch, sessionId]);

  useEffect(() => {
    if (!preprocess) {
      // determine initial domain to fit all signals
      const timestamps = Object.values(signals).reduce((object, each) => ({
        from: [...object.from, new Date(each.first_timestamp).valueOf()],
        to: [...object.from, new Date(each.last_timestamp).valueOf()],
      }), { from: [], to: [] });
      const domain = [Math.min(...timestamps.from), Math.max(...timestamps.to)];
      dispatch(setDomain(sessionId, domain));
      dispatch(upsertPlot(sessionId, { id: uuid() }, true));
    }
  }, [dispatch, preprocess, sessionId, signals]);

  const handleCreatePlot = useCallback(
    () => {
      dispatch(upsertPlot(session.id, { id: uuid() }));
    },
    [dispatch, session]
  );

  const handleChangePlot = useCallback(
    (event) => {
      const { name, value } = event.target;
      const type = name.substring(0, name.indexOf('-'));
      const id = name.substring(name.indexOf('-') + 1);
      if (type === 'dataset') {
        dispatch(upsertPlot(sessionId, { id, dataset: value, signal: '' }));
      } else {
        dispatch(upsertPlot(sessionId, { id, signal: value }));
      }
    },
    [dispatch, sessionId]
  );

  const handleClosePlot = useCallback(
    (id) => {
      dispatch(deletePlot(sessionId, id));
    },
    [dispatch, sessionId]
  );

  const handleZoom = useCallback(
    ([start, end]) => {
      dispatch(setDomain(sessionId, [Number(start), Number(end)]));
    },
    [dispatch, sessionId]
  );

  const handleLabel = (scope) => {
    setMarkedArea([new Date(scope[0]), new Date(scope[1])]);
    setSampleDialogOpen(true);
  };

  const handleAreaMarked = (data) => {
    if (preprocess.plotMode === plotModes.ZOOM_MODE) {
      handleZoom(data);
    } else if (preprocess.plotMode === plotModes.LABEL_MODE) {
      handleLabel(data);
    }
  };

  const handleCreateAnalysisSample = useCallback((data, isNewLabel) => {
    setSampleDialogOpen(false);
    dispatch(AnalysisSamples.create(
      sessionId,
      data.label,
      data.start,
      data.end,
      isNewLabel
    ));
  }, [dispatch, sessionId]);

  const renderMainSignalCard = () => {
    const plot = preprocess.plots[preprocess.mainPlot];
    return (
      <Grid item key={plot.id}>
        <SignalCard
          datasets={datasets}
          signals={ibiSignals}
          plot={plot}
          tagSignal={preprocess.tags}
          onChange={handleChangePlot}
          plotProps={{
            domainX: preprocess.domain,
            onAreaMarked: handleAreaMarked,
            mode: preprocess.plotMode,
          }}
        />
      </Grid>
    );
  };

  const renderSignalCards = () => {
    if (!preprocess) return;
    const plots = filterObjectByValue(preprocess.plots, (each) => each.id !== preprocess.mainPlot);
    return Object.values(plots).map(plot => {
      return (
        <Grid item key={plot.id}>
          <SignalCard
            datasets={datasets}
            signals={signals}
            plot={plot}
            tagSignal={preprocess.tags}
            onChange={handleChangePlot}
            onClose={handleClosePlot}
            plotProps={{
              domainX: preprocess.domain,
              onAreaMarked: handleAreaMarked,
              mode: preprocess.plotMode,
            }}
          />
        </Grid>
      );
    });
  };

  if (!session || !preprocess) {
    return <div />;
  }

  return (
    <Container>
      <Grid
        container
        direction='column'
        spacing={2}
      >
        {renderMainSignalCard()}
        {renderSignalCards()}
        <Grid item>
          <Box display='flex' justifyContent='center'>
            <Fab
              color='secondary'
              onClick={handleCreatePlot}
              disabled={!session.datasets.length}
              title='Add plot'
            >
              <AddIcon />
            </Fab>
          </Box>
        </Grid>
      </Grid>
      <AnalysisSampleDialog
        open={isSampleDialogOpen}
        scope={markedArea}
        onCancel={() => setSampleDialogOpen(false)}
        onConfirm={handleCreateAnalysisSample}
      />
    </Container>
  );
}

SessionPreprocess.propTypes = {
  match: PropTypes.object,
};

export default SessionPreprocess;
