import { apiEndpoint, useDataApi } from '.';

const url = 'sources/';

export const requestSources = (id) => {
  return apiEndpoint.get(url);
};

export const useSources = () => {
  const [state] = useDataApi(url, []);
  return state;
};
