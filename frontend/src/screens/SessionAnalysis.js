import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import SignalCard from '../components/Signal/Card';
import { getIBISignals, getDatasets } from '../selectors/data';
import { getMode } from '../selectors/plots';
import * as Plots from '../actions/plots';
import { Container } from '@material-ui/core';
import AnalysisResultList from '../components/Analysis/ResultList';
import * as Sessions from '../actions/sessions';
import * as Analysis from '../actions/analysis';
import { filterObjectByValue } from '../utils';
import { PAN_MODE, LABEL_MODE } from '../constants/PlotModes';
import { usePlots } from '../components/Signal/hooks';

SessionAnalysis.propTypes = {
  match: PropTypes.object.isRequired,
};

export default function SessionAnalysis ({ match }) {
  const dispatch = useDispatch();

  const sessionId = match.params.sessionId;
  const { plots } = usePlots(sessionId);
  const plotMode = useSelector(getMode);
  const datasets = filterObjectByValue(useSelector(getDatasets), each => each.session === sessionId);
  const signals = useSelector(getIBISignals);

  useEffect(() => {
    dispatch(Sessions.get(sessionId));
    dispatch(Analysis.list(sessionId));
  }, [dispatch, sessionId]);

  useEffect(() => {
    if (plotMode === LABEL_MODE) {
      dispatch(Plots.setMode(PAN_MODE));
    }
  }, [dispatch, plotMode]);

  const handleZoom = useCallback(
    ([start, end]) => {
      dispatch(Plots.setDomain(sessionId, [Number(start), Number(end)]));
    },
    [dispatch, sessionId]
  );

  if (!plots) {
    return <div />;
  }

  const mainPlot = plots.plots[plots.mainPlot];

  return (
    <Container>
      <SignalCard
        datasets={datasets}
        signals={signals}
        plot={mainPlot}
        plotProps={{
          domainX: plots.domain,
          mode: plotMode,
          onAreaMarked: handleZoom,
        }}
      />
      <AnalysisResultList />
    </Container>
  );
};
