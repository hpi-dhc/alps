import {
  ANALYSIS_LABEL_LIST_REQUEST,
  ANALYSIS_LABEL_CREATE_REQUEST,
} from '../constants/ActionTypes';

export const create = (name) => ({
  type: ANALYSIS_LABEL_CREATE_REQUEST,
  payload: {
    name,
  },
});

export const list = () => ({
  type: ANALYSIS_LABEL_LIST_REQUEST,
});
