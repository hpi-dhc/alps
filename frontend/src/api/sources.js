import { apiEndpoint, useDataApi } from '.';

const url = 'sources/';

export const list = () => {
  return apiEndpoint.get(url);
};

export const useSources = () => {
  const [state] = useDataApi(url, []);
  return state;
};
