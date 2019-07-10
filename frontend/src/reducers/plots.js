import {
  PLOTS_UPSERT,
  PLOTS_DELETE,
  PLOTS_SET_DOMAIN
} from '../constants/ActionTypes';

const initialState = {
  items: {},
  domains: {}
};

const plots = (state = initialState, action) => {
  switch (action.type) {
    case PLOTS_UPSERT:
      const prevDomain = state.domains[action.payload.session];
      return {
        ...state,
        items: {
          ...state.items,
          [action.id]: {
            id: action.id,
            signal: '',
            dataset: '',
            ...(state.items[action.id] || {}),
            ...action.payload
          }
        },
        domains: {
          ...state.domains,
          [action.payload.session]: prevDomain || ['dataMin', 'dataMax']
        }
      };
    case PLOTS_DELETE:
      delete state.items[action.id];
      return {
        ...state,
        items: {
          ...state.items
        }
      };
    case PLOTS_SET_DOMAIN:
      return {
        ...state,
        domains: {
          ...state.domains,
          [action.id]: action.domain
        }
      };
    default:
      return state;
  }
};

export default plots;
