import { apiEndpoint, useDataApi } from '.';

export const get = (id) => {
  return apiEndpoint.get(`datasets/${id}/`);
};

export const create = (session, data) => {
  return apiEndpoint.post(`sessions/${session}/datasets/`, data);
};

export const destroy = (id) => {
  return apiEndpoint.delete(`datasets/${id}/`);
};

export const uploadFiles = (dataset, files) => {
  const formData = new FormData();
  const metadata = {};
  for (let key in files) {
    const { file, ...rest } = files[key];
    formData.append(key, file, file.name);
    metadata[key] = rest;
  }
  formData.set('JSON', JSON.stringify(metadata));
  return apiEndpoint.post(`datasets/${dataset}/files/`, formData);
};

export const useDataset = (id) => {
  const [state] = useDataApi(`datasets/${id}/`, {});
  return state;
};

export const useDatasetsOfSession = (id) => {
  const [state] = useDataApi(`sessions/${id}/datasets/`, {});
  return state;
};
