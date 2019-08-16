import { apiEndpoint } from '.';

export const create = (payload) => {
  return apiEndpoint.post('analysis/', payload);
};

export const list = (session) => {
  const queryParams = new URLSearchParams();
  if (session) {
    queryParams.append('session', session);
  }
  return apiEndpoint.get('analysis/?' + queryParams.toString());
};

export const get = (id) => {
  return apiEndpoint.get(`analysis/${id}/`);
};
