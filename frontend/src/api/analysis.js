import { apiEndpoint, apiFileEndpoint } from '.';

export const create = (payload) => {
  return apiEndpoint.post('analysis/', payload);
};

export const list = (session) => {
  const queryParams = new URLSearchParams();
  if (session) {
    queryParams.append('session', session);
  }
  return apiEndpoint.get('analysis/', { params: queryParams });
};

export const get = (id) => {
  return apiEndpoint.get(`analysis/${id}/`);
};

export const exportResults = (sessions = [], labels = []) => {
  const queryParams = new URLSearchParams();
  sessions.forEach(each => queryParams.append('session', each));
  labels.forEach(each => queryParams.append('label', each));
  return apiFileEndpoint.get('analysis/export/', { params: queryParams });
};
