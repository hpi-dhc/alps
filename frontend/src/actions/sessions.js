import {
  SESSION_GET_REQUEST,
  SESSION_CREATE_REQUEST,
  SESSION_DESTROY_REQUEST,
  SESSION_LIST_REQUEST,
} from '../constants/ActionTypes';

export const get = (id) => ({
  type: SESSION_GET_REQUEST,
  id,
});

export const list = () => ({
  type: SESSION_LIST_REQUEST,
});

export const create = (payload) => ({
  type: SESSION_CREATE_REQUEST,
  payload,
});

export const destroy = (id) => ({
  type: SESSION_DESTROY_REQUEST,
  id,
});
