import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import uuid from 'uuid/v4';

import { Container, Fab, Grid } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import SignalCard from '../components/Signal/Card';
import { filterObjectByValue } from '../utils';

import { getSessions, getSignals, getDatasets } from '../selectors/data';
import { getPlots, getPlotIdsBySession, getDomains } from '../selectors/plots';
import { upsertPlot, deletePlot, setPlotDomain } from '../actions/plots';
import * as Sessions from '../actions/sessions';

function SessionPreprocess ({ match }) {
  const sessionId = match.params.sessionId;
  const session = useSelector(getSessions)[sessionId];
  const datasets = useSelector((state) => {
    const allDatasets = getDatasets(state);
    return filterObjectByValue(allDatasets, each => each.session === sessionId);
  });
  const signals = useSelector(getSignals);
  const plotIds = useSelector((state) => getPlotIdsBySession(state)[sessionId]);
  const plots = useSelector((state) => getPlots(state));
  const domains = useSelector((state) => getDomains(state));

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(Sessions.get(sessionId));
  }, [dispatch, sessionId]);

  const handleCreatePlot = useCallback(
    () => {
      if (!plotIds) {
        // determine initial domain to fit all signals
        const timestamps = Object.values(signals).reduce((object, each) => ({
          from: [...object.from, moment(each.first_timestamp).valueOf()],
          to: [...object.from, moment(each.last_timestamp).valueOf()],
        }), { from: [], to: [] });
        const domain = [Math.min(...timestamps.from), Math.max(...timestamps.to)];
        dispatch(setPlotDomain(session.id, domain));
      }
      dispatch(upsertPlot(uuid(), { session: session.id }));
    },
    [dispatch, session, signals, plotIds]
  );

  const handleChangePlot = useCallback(
    (event) => {
      const { name, value } = event.target;
      const type = name.substring(0, name.indexOf('-'));
      const id = name.substring(name.indexOf('-') + 1);
      if (type === 'dataset') {
        dispatch(upsertPlot(id, { dataset: value, signal: '' }));
      } else {
        dispatch(upsertPlot(id, { signal: value }));
      }
    },
    [dispatch]
  );

  const handleClosePlot = useCallback(
    (id) => {
      dispatch(deletePlot(id));
    },
    [dispatch]
  );

  const handleZoom = useCallback(
    ([start, end]) => {
      dispatch(setPlotDomain(sessionId, [Number(start), Number(end)]));
    },
    [dispatch, sessionId]
  );

  const renderSignalCards = () => {
    if (!plotIds) return;
    return plotIds.map(each => {
      const plot = plots[each];
      let domainY = ['auto', 'auto'];
      if (plot.signal) {
        domainY = [
          signals[plot.signal].y_min,
          signals[plot.signal].y_max,
        ];
      }
      return (
        <Grid item key={each}>
          <SignalCard
            datasets={datasets}
            signals={signals}
            onChange={handleChangePlot}
            onClose={handleClosePlot}
            plot={plot}
            plotProps={{
              domainX: domains[sessionId],
              domainY: domainY,
              onAreaMarked: handleZoom,
            }}
          />
        </Grid>
      );
    });
  };

  if (!session) {
    return <div />;
  }

  return (
    <Container>
      <Grid
        container
        direction='column'
        spacing={2}
      >
        {renderSignalCards()}
        <Grid item>
          <Fab
            color='secondary'
            onClick={handleCreatePlot}
            disabled={!session.datasets.length}
          >
            <AddIcon />
          </Fab>
        </Grid>
      </Grid>
    </Container>
  );
}

SessionPreprocess.propTypes = {
  match: PropTypes.object,
};

export default SessionPreprocess;
