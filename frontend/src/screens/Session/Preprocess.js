import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { normalize } from 'normalizr';
import moment from 'moment';
import uuid from 'uuid/v4';

import { Container, Fab, Grid } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import { useSession } from '../../api/sessions';
import { getPlots, getPlotIdsBySession, getDomains } from '../../selectors/plots';
import { useAppBarTitle } from '../../components/Common/AppBar';
import SignalCard from '../../components/Signal/Card';
import { upsertPlot, deletePlot, setPlotDomain } from '../../actions/plots';
import * as schemas from '../../schemas';

function SessionPreprocess ({ match }) {
  const sessionId = match.params.sessionId;

  const { data: session } = useSession(sessionId);
  const normalized = normalize(session, schemas.session);
  const plotIds = useSelector((state) => getPlotIdsBySession(state)[sessionId]);
  const plots = useSelector((state) => getPlots(state));
  const domains = useSelector((state) => getDomains(state));

  useAppBarTitle(session.title);

  const dispatch = useDispatch();

  const handleCreatePlot = useCallback(
    () => {
      if (!plotIds) {
        // determine initial domain to fit all signals
        const { entities: { signals } } = normalize(session, schemas.session);
        const timestamps = Object.values(signals).reduce((object, each) => ({
          from: [...object.from, moment(each.first_timestamp).valueOf()],
          to: [...object.from, moment(each.last_timestamp).valueOf()],
        }), { from: [], to: [] });
        const domain = [Math.min(...timestamps.from), Math.max(...timestamps.to)];
        dispatch(setPlotDomain(session.id, domain));
      }
      dispatch(upsertPlot(uuid(), { session: session.id }));
    },
    [dispatch, session, plotIds]
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
          normalized.entities.signals[plot.signal].y_min,
          normalized.entities.signals[plot.signal].y_max,
        ];
      }
      return (
        <Grid item key={each}>
          <SignalCard
            datasets={normalized.entities.datasets}
            signals={normalized.entities.signals}
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

  if (!session.datasets) {
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
