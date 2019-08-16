import { apiEndpoint } from '.';

export const list = () => {
  return apiEndpoint.get('processing_methods/');
};
