import { apiEndpoint } from '.';

export const list = (session) => {
  let queryParams = new URLSearchParams();

  if (session) queryParams.append('session', session);

  return apiEndpoint.get('analysis_snapshots/?' + queryParams.toString(), {});
};

export const create = (name, analyses) => {
  return apiEndpoint.post('analysis_snapshots/', { name, analyses });
};
