import { apiEndpoint, useDataApi } from '.';

const url = 'subjects/';

export const requestSubjects = () => {
  return apiEndpoint.get(url);
};

export const createSubject = (data) => {
  return apiEndpoint.post(url, data);
};

export const deleteSubject = (id) => {
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
