import { useEffect } from 'react';
import moment from 'moment';
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

export const useSignalSamples = (id, domain, maxSamples = 1000) => {
  const [state, setUrl] = useDataApi('', []);

  useEffect(
    () => {
      if (!id) {
        setUrl('');
      } else {
        let url = `signals/${id}/samples/?`;
        let queryParams = new URLSearchParams();

        queryParams.append('max_samples', maxSamples);

        const fromMoment = moment(Number(domain[0])).subtract(1, 'second');
        if (fromMoment && fromMoment.isValid()) {
          queryParams.append('start', fromMoment.format());
        }

        const toMoment = moment(Number(domain[1])).add(1, 'second');
        if (toMoment && toMoment.isValid()) {
          queryParams.append('end', toMoment.format());
        }

        setUrl(url + queryParams.toString());
      }
    },
    [id, domain, setUrl, maxSamples]
  );

  return state;
};
