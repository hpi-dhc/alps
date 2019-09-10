import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import uuid from 'uuid/v4';

import { Container, Fab, Grid, Box } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import SignalCard from '../components/Signal/Card';
import { filterObjectByValue } from '../utils';

import { getSessions, getIBISignals } from '../selectors/data';
import { getMode } from '../selectors/plots';
import * as Plots from '../actions/plots';
import * as Sessions from '../actions/sessions';
import * as AnalysisSamples from '../actions/analysisSamples';
import * as plotModes from '../constants/PlotModes';
import AnalysisSampleDialog from '../components/AnalysisSample/Dialog';
import { usePlots } from '../components/Signal/hooks';

function SessionPreprocess ({ match }) {
  const sessionId = match.params.sessionId;
  const session = useSelector(getSessions)[sessionId];
  const { plots, datasets, signals } = usePlots(sessionId);
  const ibiSignals = useSelector(getIBISignals);
  const plotMode = useSelector(getMode);
  const [isSampleDialogOpen, setSampleDialogOpen] = useState(false);
  const [markedArea, setMarkedArea] = useState([null, null]);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(Sessions.get(sessionId));
  }, [dispatch, sessionId]);

  const handleCreatePlot = useCallback(
    () => {
      dispatch(Plots.upsert(session.id, { id: uuid() }));
    },
    [dispatch, session]
  );

  const handleZoom = useCallback(
    ([start, end]) => {
      dispatch(Plots.setDomain(sessionId, [Number(start), Number(end)]));
    },
    [dispatch, sessionId]
  );

  const handleLabel = (scope) => {
    setMarkedArea([new Date(scope[0]), new Date(scope[1])]);
    setSampleDialogOpen(true);
  };

  const handleAreaMarked = (data) => {
    if (plotMode === plotModes.ZOOM_MODE) {
      handleZoom(data);
    } else if (plotMode === plotModes.LABEL_MODE) {
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
    const plot = plots.plots[plots.mainPlot];
    return (
      <Grid item key={plot.id} style={{ position: 'sticky', top: 130, zIndex: 1000 }}>
        <SignalCard
          datasets={datasets}
          signals={ibiSignals}
          plot={plot}
          elevation={6}
          tagSignal={plots.tags}
          plotProps={{
            domainX: plots.domain,
            onAreaMarked: handleAreaMarked,
            mode: plotMode,
          }}
        />
      </Grid>
    );
  };

  const renderSignalCards = () => {
    if (!plots) return;
    const contextPlots = filterObjectByValue(plots.plots, (each) => each.id !== plots.mainPlot);
    return Object.values(contextPlots).map(plot => {
      return (
        <Grid item key={plot.id}>
          <SignalCard
            datasets={datasets}
            signals={signals}
            plot={plot}
            tagSignal={plots.tags}
            closable
            plotProps={{
              domainX: plots.domain,
              onAreaMarked: handleAreaMarked,
              mode: plotMode,
            }}
          />
        </Grid>
      );
    });
  };

  if (!session || !plots) {
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
