import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Container } from '@material-ui/core';
import * as Sessions from '../actions/sessions';

SessionSync.propTypes = {
  match: PropTypes.object.isRequired,
};

export default function SessionSync ({ match }) {
  const dispatch = useDispatch();

  const sessionId = match.params.sessionId;

  useEffect(() => {
    dispatch(Sessions.get(sessionId));
  }, [dispatch, sessionId]);

  return (
    <Container>
      Soon you will be able to synchronize your datasets.
    </Container>
  );
};
