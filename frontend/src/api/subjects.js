import { apiEndpoint, useDataApi } from '.';

const url = 'subjects/';

export const get = (id) => {
  return apiEndpoint.get(url + id);
};

export const list = () => {
  return apiEndpoint.get(url);
};

export const create = (data) => {
  return apiEndpoint.post(url, data);
};

export const destroy = (id) => {
  return apiEndpoint.delete(url + id);
};

export const useSubjects = (id) => {
  let url = `subjects/`;
  if (id) {
    url += `${id}/`;
  }
  const [state] = useDataApi(url, id ? {} : []);
  return state;
};
