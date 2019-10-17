import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Container, Button, Typography, Box } from '@material-ui/core';
import * as Sessions from '../actions/sessions';
import * as Sync from '../actions/sync';
import { getSessions } from '../selectors/data';
import {
  getParametersForSync,
  canSyncSignals,
  getError,
  getReferenceDate,
} from '../selectors/sync';
import SignalComparison from '../components/Synchronization/SignalComparison';
import { SynchronizationParameters } from '../components/Synchronization/Parameters';
import SynchronizationOptions from '../components/Synchronization/Options';

SessionSync.propTypes = {
  match: PropTypes.object.isRequired,
};

export default function SessionSync ({ match }) {
  const dispatch = useDispatch();
  const sessionId = match.params.sessionId;
  const session = useSelector(getSessions)[sessionId];
  const referenceDate = useSelector(getReferenceDate);
  const paramsForRequest = useSelector(getParametersForSync);
  const isSyncDisabled = !useSelector(canSyncSignals);
  const isError = Boolean(useSelector(getError));

  useEffect(() => {
    dispatch(Sessions.get(sessionId));
  }, [dispatch, sessionId]);

  useEffect(() => {
    dispatch(Sync.reset(session.datasets));
  }, [dispatch, session.datasets]);

  const handleExecuteRequest = useCallback(() => {
    dispatch(Sync.requestSync(referenceDate.toISOString(), paramsForRequest));
  }, [dispatch, paramsForRequest, referenceDate]);

  return (
    <Container>
      <Box display='flex'>
        <Box display='flex' flexDirection='column' width={300} marginRight={2}>
          <SynchronizationParameters datasets={session.datasets} />
          <SynchronizationOptions />
        </Box>
        <Box width='100%' display='flex' flexDirection='column' alignItems='stretch'>
          <SignalComparison />
          <Button
            onClick={handleExecuteRequest}
            variant='contained'
            color='secondary'
            disabled={isSyncDisabled}
          >
            Sync datasets
          </Button>
          <Typography hidden={!isError} color='error'>Request failed.</Typography>
        </Box>
      </Box>
    </Container>
  );
};
