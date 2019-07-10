import { apiEndpoint, useDataApi } from '.';

const url = 'datasets/';
const sessionUrl = 'sessions/';
const filesUrl = 'files/';

export const createDataset = (session, data) => {
  return apiEndpoint.post(`${sessionUrl}${session}/${url}`, data);
};

export const deleteDataset = (id) => {
  return apiEndpoint.delete(`${url}${id}/`);
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
  return apiEndpoint.post(`${url}${dataset}/${filesUrl}`, formData);
};

export const useDataset = (id) => {
  const [state] = useDataApi(`datasets/${id}/`, {});
  return state;
};

export const useDatasetsOfSession = (id) => {
  const [state] = useDataApi(`sessions/${id}/datasets/`, {});
  return state;
};
