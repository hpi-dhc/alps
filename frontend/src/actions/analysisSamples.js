import {
  ANALYSIS_SAMPLE_CREATE_REQUEST,
  ANALYSIS_SAMPLE_DESTROY_REQUEST,
  ANALYSIS_SAMPLE_UPDATE_REQUEST,
} from '../constants/ActionTypes';

export const create = (session, label, start, end, isNewLabel = false) => ({
  type: ANALYSIS_SAMPLE_CREATE_REQUEST,
  session,
  isNewLabel,
  payload: {
    label,
    start,
    end,
  },
});

export const update = (id, payload) => ({
  type: ANALYSIS_SAMPLE_UPDATE_REQUEST,
  id,
  payload,
});

export const destroy = (id) => ({
  type: ANALYSIS_SAMPLE_DESTROY_REQUEST,
  id,
});
