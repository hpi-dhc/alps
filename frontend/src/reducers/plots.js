import {
  PLOT_DELETE,
  PLOT_UPSERT,
  PLOT_SET_DOMAIN,
  PLOT_SET_TAGS,
  PLOT_SET_MODE,
} from '../constants/ActionTypes';
import { ZOOM_MODE } from '../constants/PlotModes';

const initialSessionState = {
  plots: {},
  mainPlot: '',
  tags: '',
  domain: ['auto', 'auto'],
};

const initialPlotState = {
  dataset: '',
  signal: '',
  domainY: ['auto', 'auto'],
};

const initialState = {
  mode: ZOOM_MODE,
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
    case PLOT_UPSERT: {
      return updateSession(state, action.session, (session) => {
        const plots = session ? session.plots : {};
        const plot = plots ? session.plots[action.payload.id] : initialPlotState;
        return {
          ...initialSessionState,
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
    case PLOT_DELETE: {
      delete state.items[action.session].plots[action.id];
      return {
        ...state,
        items: {
          ...state.items,
        },
      };
    }
    case PLOT_SET_MODE: {
      return {
        ...state,
        mode: action.mode,
      };
    }
    case PLOT_SET_DOMAIN: {
      return updateSession(state, action.session, (session) => ({
        ...session,
        domain: action.domain,
      }));
    }
    case PLOT_SET_TAGS: {
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
