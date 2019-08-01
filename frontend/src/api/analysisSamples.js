import { apiEndpoint } from '.';

export const create = (session, label, start, end) => {
  return apiEndpoint.post(
    `sessions/${session}/analysis_samples/`,
    { label, start, end }
  );
};

export const update = (id, payload) => {
  return apiEndpoint.put(`analysis_samples/${id}/`, payload);
};

export const destroy = (id) => {
  return apiEndpoint.delete(`analysis_samples/${id}/`);
};

export const get = (id) => {
  return apiEndpoint.get(`analysis_samples/${id}/`);
};
