import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import SignalCard from '../components/Signal/Card';
import { getIBISignals, getDatasets } from '../selectors/data';
import { getItems, getMode } from '../selectors/plots';
import { Container } from '@material-ui/core';
import AnalysisResultList from '../components/Analysis/ResultList';
import * as Analysis from '../actions/analysis';
import { filterObjectByValue } from '../utils';

SessionAnalysis.propTypes = {
  match: PropTypes.object.isRequired,
};

export default function SessionAnalysis ({ match }) {
  const dispatch = useDispatch();

  const sessionId = match.params.sessionId;
  const plots = useSelector((state) => getItems(state)[sessionId]);
  const mainPlot = plots.plots[plots.mainPlot];
  const plotMode = useSelector(getMode);
  const datasets = filterObjectByValue(useSelector(getDatasets), each => each.session === sessionId);
  const signals = useSelector(getIBISignals);

  useEffect(() => {
    dispatch(Analysis.list(sessionId));
  }, [dispatch, sessionId]);

  return (
    <Container>
      <SignalCard
        datasets={datasets}
        signals={signals}
        plot={mainPlot}
        plotProps={{
          domainX: plots.domain,
          mode: plotMode,
        }}
      />
      <AnalysisResultList />
    </Container>
  );
};
