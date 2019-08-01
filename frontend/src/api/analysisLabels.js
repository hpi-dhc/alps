import { apiEndpoint } from '.';

export const list = () => {
  return apiEndpoint.get('analysis_labels/');
};

export const create = (name) => {
  return apiEndpoint.post('analysis_labels/', { name });
};

export const update = (id, payload) => {
  return apiEndpoint.put(`analysis_labels/${id}/`, payload);
};

export const destroy = (id) => {
  return apiEndpoint.delete(`analysis_labels/${id}/`);
};

export const get = (id) => {
  return apiEndpoint.get(`analysis_labels/${id}/`);
};
