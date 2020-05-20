import axios from 'axios';
import { useEffect, useState } from 'react';
import { keysToCamel, keysToSnake } from '../utils';

const serverURL = process.env.REACT_APP_BACKEND_URL;

console.log('Backend at', serverURL);

export const authEndpoint = axios.create({
  baseURL: serverURL + 'auth/',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  transformResponse: (data) => keysToCamel(JSON.parse(data)),
});

export const apiEndpoint = axios.create({
  baseURL: serverURL + 'api/',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  transformRequest: (data, headers) => {
    if (data instanceof FormData) {
      return data;
    }
    return JSON.stringify(keysToSnake(data));
  },
  transformResponse: (data) => data ? keysToCamel(JSON.parse(data)) : data,
});

export const apiFileEndpoint = axios.create({
  baseURL: serverURL + 'api/',
  headers: {
    'Accept': 'application/json',
  },
});

// this array is used to set configuration parameters on all endpoints
export const endpointArray = [authEndpoint, apiEndpoint, apiFileEndpoint];

const CancelToken = axios.CancelToken;

export const useDataApi = (initialUrl, initialData, processData) => {
  const [url, setUrl] = useState(initialUrl);
  const [data, setData] = useState(initialData);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadTimestamp, setReloadTimestamp] = useState(Date.now());

  const reload = () => {
    setReloadTimestamp(Date.now());
  };

  // Causes endless loop
  // useEffect(
  //   () => {
  //     if (!url) {
  //       setData(initialData);
  //     }
  //   },
  //   [url, initialData]
  // );

  useEffect(
    () => {
      const source = CancelToken.source();
      let didCancel = false;

      const fetchData = async () => {
        setIsError(false);
        setIsLoading(true);

        try {
          const response = await apiEndpoint.get(
            url, { cancelToken: source.token }
          );
          let responseData = response.data;
          if (processData) {
            responseData = processData(responseData);
          }
          if (!didCancel) {
            setData(responseData);
          }
        } catch (error) {
          if (!didCancel) {
            setIsError(true);
          }
        }

        setIsLoading(false);
      };

      if (url) {
        fetchData();
      }

      return () => {
        didCancel = true;
        source.cancel();
      };
    },
    [url, processData, reloadTimestamp]
  );

  return [{ data, isError, isLoading, reload }, setUrl];
};
