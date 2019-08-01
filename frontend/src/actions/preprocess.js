import {
  PREPROCESS_INIT,
  PREPROCESS_PLOTS_UPSERT,
  PREPROCESS_PLOTS_DELETE,
  PREPROCESS_SET_DOMAIN,
  PREPROCESS_SET_TAGS,
  PREPROCESS_SET_PLOT_MODE,
} from '../constants/ActionTypes';

export const initPreprocess = (session) => ({
  type: PREPROCESS_INIT,
  session,
});

export const upsertPlot = (session, payload, isMainPlot = false) => ({
  type: PREPROCESS_PLOTS_UPSERT,
  session,
  isMainPlot,
  payload,
});

export const deletePlot = (session, id) => ({
  type: PREPROCESS_PLOTS_DELETE,
  session,
  id,
});

export const setPlotMode = (session, mode) => ({
  type: PREPROCESS_SET_PLOT_MODE,
  session,
  mode,
});

export const setDomain = (session, domain) => ({
  type: PREPROCESS_SET_DOMAIN,
  session,
  domain,
});

export const setTags = (session, tags) => ({
  type: PREPROCESS_SET_TAGS,
  session,
  tags,
});
