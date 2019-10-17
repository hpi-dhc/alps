import { useEffect } from 'react';
import { addSeconds, subSeconds, isValid } from 'date-fns';
import { apiEndpoint, useDataApi } from '.';

export const get = (id) => {
  return apiEndpoint.get(`signals/${id}/`);
};

export const requestSamples = (id, domain, maxSamples = 2000, normalize = false, stretchFactor, timeshift, referenceTime) => {
  const url = `signals/${id}/samples/`;
  const start = domain[0] ? subSeconds(new Date(Number(domain[0])), 1) : undefined;
  const end = domain[1] ? addSeconds(new Date(Number(domain[1])), 1) : undefined;
  return apiEndpoint.get(url, {
    params: {
      start: isValid(start) ? start : null,
      end: isValid(end) ? end : null,
      max_samples: maxSamples,
      normalize,
      stretch_factor: stretchFactor,
      timeshift,
      reference_time: referenceTime,
    },
  });
};

export const filter = (id, filter, configuration) => {
  return apiEndpoint.post('filter/', {
    signal: id,
    filter,
    configuration,
  });
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
