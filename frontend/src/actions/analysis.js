import {
  ANALYSIS_METHOD_CONFIG_SET,
  ANALYSIS_RESULT_LIST_REQUEST,
  ANALYSIS_METHOD_ADD,
  ANALYSIS_METHOD_REMOVE,
  ANALYSIS_RUN,
  ANALYSIS_SIGNAL_ADD,
  ANALYSIS_SIGNAL_REMOVE,
  ANALYSIS_RESET,
  ANALYSIS_RESULT_EXPORT_REQUEST,
} from '../constants/ActionTypes';

export const run = (signal, label, methods, config) => ({
  type: ANALYSIS_RUN,
  signal,
  label,
  methods,
  config,
});

export const setConfigParameter = (method, key, value) => ({
  type: ANALYSIS_METHOD_CONFIG_SET,
  method,
  key,
  value,
});

export const addMethod = (id) => ({
  type: ANALYSIS_METHOD_ADD,
  id,
});

export const removeMethod = (id) => ({
  type: ANALYSIS_METHOD_REMOVE,
  id,
});

export const addSignal = (id) => ({
  type: ANALYSIS_SIGNAL_ADD,
  id,
});

export const removeSignal = (id) => ({
  type: ANALYSIS_SIGNAL_REMOVE,
  id,
});

export const reset = () => ({
  type: ANALYSIS_RESET,
});

export const list = (session) => ({
  type: ANALYSIS_RESULT_LIST_REQUEST,
  session,
});

export const exportResults = (sessions, labels) => ({
  type: ANALYSIS_RESULT_EXPORT_REQUEST,
  payload: {
    sessions,
    labels,
  },
});
