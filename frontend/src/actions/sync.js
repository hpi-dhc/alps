import {
  SYNC_RESET,
  SYNC_SIGNAL_SET,
  SYNC_OPTIONS_SET,
  SYNC_PARAMS_REQUEST,
  SYNC_EXECUTE_REQUEST,
  SYNC_DOMAIN_SET,
  SYNC_PARAMS_SET,
} from '../constants/ActionTypes';

export const reset = (datasets) => ({
  type: SYNC_RESET,
  datasets,
});

export const setDomain = (domain = [null, null]) => ({
  type: SYNC_DOMAIN_SET,
  domain,
});

export const setSignal = (dataset, signal, isReference = false) => ({
  type: SYNC_SIGNAL_SET,
  dataset,
  signal,
  isReference,
});

export const setOptions = (options) => ({
  type: SYNC_OPTIONS_SET,
  options,
});

export const setParams = (dataset, params) => ({
  type: SYNC_PARAMS_SET,
  dataset,
  params,
});

export const requestParams = () => ({
  type: SYNC_PARAMS_REQUEST,
});

export const requestSync = (referenceTime, params) => ({
  type: SYNC_EXECUTE_REQUEST,
  referenceTime,
  params,
});
