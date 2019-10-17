import {
  SIGNAL_FILTER_REQUEST, SIGNAL_STOP_POLLING, SIGNAL_START_POLLING,
} from '../constants/ActionTypes';

export const filter = (session, signal, filter, configuration = {}) => ({
  type: SIGNAL_FILTER_REQUEST,
  payload: {
    session,
    signal,
    filter,
    configuration,
  },
});

export const startPolling = (id) => ({
  type: SIGNAL_START_POLLING,
  id,
});

export const stopPolling = (id) => ({
  type: SIGNAL_STOP_POLLING,
  id,
});
