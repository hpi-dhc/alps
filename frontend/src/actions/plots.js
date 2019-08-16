import {
  PLOT_UPSERT,
  PLOT_DELETE,
  PLOT_SET_DOMAIN,
  PLOT_SET_TAGS,
  PLOT_SET_MODE,
} from '../constants/ActionTypes';

export const upsert = (session, payload, isMainPlot = false) => ({
  type: PLOT_UPSERT,
  session,
  isMainPlot,
  payload,
});

export const destroy = (session, id) => ({
  type: PLOT_DELETE,
  session,
  id,
});

export const setMode = (mode) => ({
  type: PLOT_SET_MODE,
  mode,
});

export const setDomain = (session, domain) => ({
  type: PLOT_SET_DOMAIN,
  session,
  domain,
});

export const setTags = (session, tags) => ({
  type: PLOT_SET_TAGS,
  session,
  tags,
});
