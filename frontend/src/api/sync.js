import { apiEndpoint } from '.';

export const getParams = (reference, signals, configuration = {}) => {
  return apiEndpoint.post('sync/', { reference, signals, configuration });
};

export const sync = (referenceTime, params) => {
  return apiEndpoint.put('sync/', { reference_time: referenceTime, params });
};
