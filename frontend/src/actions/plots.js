import {
  PLOTS_UPSERT,
  PLOTS_DELETE,
  PLOTS_SET_DOMAIN
} from '../constants/ActionTypes'

export const upsertPlot = (id, payload) => ({
  type: PLOTS_UPSERT,
  id,
  payload
})

export const deletePlot = (id) => ({
  type: PLOTS_DELETE,
  id
})

export const setPlotDomain = (id, domain) => ({
  type: PLOTS_SET_DOMAIN,
  id,
  domain
})
