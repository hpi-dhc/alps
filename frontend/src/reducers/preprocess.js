import {
  PREPROCESS_PLOTS_DELETE,
  PREPROCESS_PLOTS_UPSERT,
  PREPROCESS_SET_DOMAIN,
  PREPROCESS_SET_TAGS,
  PREPROCESS_SET_PLOT_MODE,
} from '../constants/ActionTypes';
import { ZOOM_MODE } from '../constants/PlotModes';

const initialItemState = {
  plots: {},
  mainPlot: '',
  tags: '',
  domain: ['auto', 'auto'],
  plotMode: ZOOM_MODE,
};

const initialPlotState = {
  dataset: '',
  signal: '',
};

const initialState = {
  defaultSettings: {},
  items: {},
};

const updateSession = (state, id, func) => {
  const session = state.items[id];
  const newSession = func(session);
  return {
    ...state,
    items: {
      ...state.items,
      [id]: newSession,
    },
  };
};

const preprocess = (state = initialState, action) => {
  switch (action.type) {
    case PREPROCESS_PLOTS_UPSERT: {
      return updateSession(state, action.session, (session) => {
        const plots = session ? session.plots : {};
        const plot = plots ? session.plots[action.payload.id] : initialPlotState;
        return {
          ...initialItemState,
          ...session,
          mainPlot: action.isMainPlot ? action.payload.id : session.mainPlot,
          plots: {
            ...plots,
            [action.payload.id]: {
              ...initialPlotState,
              session: action.session,
              ...plot,
              ...action.payload,
            },
          },
        };
      });
    }
    case PREPROCESS_PLOTS_DELETE: {
      delete state.items[action.session].plots[action.id];
      return {
        ...state,
        items: {
          ...state.items,
        },
      };
    }
    case PREPROCESS_SET_PLOT_MODE: {
      return updateSession(state, action.session, (session) => ({
        ...session,
        plotMode: action.mode,
      }));
    }
    case PREPROCESS_SET_DOMAIN: {
      return updateSession(state, action.session, (session) => ({
        ...session,
        domain: action.domain,
      }));
    }
    case PREPROCESS_SET_TAGS: {
      return updateSession(state, action.session, (session) => ({
        ...session,
        tags: action.tags,
      }));
    }
    default:
      return state;
  }
};

export default preprocess;
