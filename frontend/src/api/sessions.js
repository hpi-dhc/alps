import { apiEndpoint, useDataApi } from '.';

const url = 'sessions/';
const subjectUrl = 'subjects/';

export const requestSession = (id) => {
  return apiEndpoint.get(`${url}${id}/`);
};

export const createSession = (subject, data) => {
  return apiEndpoint.post(`${subjectUrl}${subject}/${url}`, data);
};

export const deleteSession = (id) => {
  return apiEndpoint.delete(`${url}${id}`);
};

export const useSession = (id) => {
  const [state] = useDataApi(`sessions/${id}/`, {});
  return state;
};

export const useSessionsOfSubject = (id) => {
  const [state] = useDataApi(`subjects/${id}/sessions/`, []);
  return state;
};
