import { useEffect } from 'react';
import { addSeconds, subSeconds, isValid } from 'date-fns';
import { apiEndpoint, useDataApi } from '.';

export const requestSignal = (id) => {
  return apiEndpoint.get(`signals/${id}/`);
};

export const requestSamples = (id, from, to) => {
  let url = `signals/${id}/samples/`;
  if (from && from.isValid() && to && to.isValid()) {
    url += `${from.format()}/${to.format()}/`;
  }
  return apiEndpoint.get(url);
};

export const useSignal = (id) => {
  const [state] = useDataApi(`signals/${id}/`, {});
  return state;
};

export const useSignalSamples = (id, domain, maxSamples = 2000) => {
  const [state, setUrl] = useDataApi('', []);

  useEffect(
    () => {
      if (!id) {
        setUrl('');
      } else {
        let url = `signals/${id}/samples/?`;
        let queryParams = new URLSearchParams();

        queryParams.append('max_samples', maxSamples);

        const from = subSeconds(new Date(Number(domain[0])), 1);
        if (from && isValid(from)) {
          queryParams.append('start', from.toISOString());
        }

        const to = addSeconds(new Date(Number(domain[1])), 1);
        if (to && isValid(to)) {
          queryParams.append('end', to.toISOString());
        }

        setUrl(url + queryParams.toString());
      }
    },
    [id, domain, setUrl, maxSamples]
  );

  return state;
};
