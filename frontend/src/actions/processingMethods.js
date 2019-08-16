import {
  PROCESSINGMETHOD_LIST_REQUEST,
  PROCESSINGMETHOD_LIST_SUCCESS,
  PROCESSINGMETHOD_FAILURE,
} from '../constants/ActionTypes';

export const requestSourceList = () => ({
  type: PROCESSINGMETHOD_LIST_REQUEST,
});

export const receiveSourceList = (payload) => ({
  type: PROCESSINGMETHOD_LIST_SUCCESS,
  payload,
});

export const sourceError = (message) => ({
  type: PROCESSINGMETHOD_FAILURE,
  message,
});
