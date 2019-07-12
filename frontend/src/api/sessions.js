import { apiEndpoint, useDataApi } from '.';

export const get = (id) => {
  return apiEndpoint.get(`sessions/${id}/`);
};

export const list = (subjectId) => {
  if (subjectId) {
    return apiEndpoint.get(`subjects/${subjectId}/sessions/`);
  }
  return apiEndpoint.get('sessions/');
};

export const create = (subjectId, data) => {
  return apiEndpoint.post(`subjects/${subjectId}/sessions/`, data);
};

export const destroy = (id) => {
  return apiEndpoint.delete(`sessions/${id}`);
};

export const useSession = (id) => {
  const [state] = useDataApi(`sessions/${id}/`, {});
  return state;
};

export const useSessionsOfSubject = (id) => {
  const [state] = useDataApi(`subjects/${id}/sessions/`, []);
  return state;
};
