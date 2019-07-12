import {
  DATASET_GET_REQUEST,
  DATASET_CREATE_REQUEST,
  DATASET_START_POLLING,
  DATASET_STOP_POLLING,
  DATASET_DESTROY_REQUEST,
} from '../constants/ActionTypes';

export const get = (id) => ({
  type: DATASET_GET_REQUEST,
  id,
});

export const create = (payload) => ({
  type: DATASET_CREATE_REQUEST,
  payload,
});

export const destroy = (id) => ({
  type: DATASET_DESTROY_REQUEST,
  id,
});

export const startPolling = (id) => ({
  type: DATASET_START_POLLING,
  id,
});

export const stopPolling = (id) => ({
  type: DATASET_STOP_POLLING,
  id,
});
