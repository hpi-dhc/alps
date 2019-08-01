import {
  SUBJECT_GET_REQUEST,
  SUBJECT_LIST_REQUEST,
  SUBJECT_CREATE_REQUEST,
  SUBJECT_DESTROY_REQUEST,
} from '../constants/ActionTypes';

export const list = () => ({
  type: SUBJECT_LIST_REQUEST,
});

export const get = (id) => ({
  type: SUBJECT_GET_REQUEST,
  id,
});

export const destroy = (id) => ({
  type: SUBJECT_DESTROY_REQUEST,
  id,
});

export const create = (identifier) => ({
  type: SUBJECT_CREATE_REQUEST,
  payload: {
    identifier,
  },
});
