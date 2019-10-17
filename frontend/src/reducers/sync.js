import {
  SYNC_RESET,
  SYNC_ERROR,
  SYNC_SIGNAL_SET,
  SYNC_OPTIONS_SET,
  SYNC_PARAMS_SET,
  SYNC_PARAMS_REQUEST,
  SYNC_PARAMS_SUCCESS,
  SYNC_EXECUTE_REQUEST,
  SYNC_EXECUTE_SUCCESS,
  SYNC_DOMAIN_SET,
  SYNC_SAMPLES_SUCCESS,
} from '../constants/ActionTypes';

const initialParams = { timeshift: '0', stretchFactor: '1' };

const initialState = {
  isLoading: false,
  error: null,
  reference: null,
  domain: [null, null],
  signals: {},
  samples: {},
  params: {},
  segments: {},
  options: {
    window: 600,
    threshold: 0.3,
    distance: 1500,
    minLength: 6,
    timeBuffer: 1,
  },
};

const createInitialState = (datasets = []) => {
  return {
    ...initialState,
    params: datasets.reduce((object, id) => ({
      ...object,
      [id]: { ...initialParams },
    }), {}),
  };
};

const sync = (state = initialState, action) => {
  switch (action.type) {
    case SYNC_RESET:
      return createInitialState(action.datasets);
    case SYNC_DOMAIN_SET:
      return {
        ...state,
        domain: action.domain,
      };
    case SYNC_SIGNAL_SET:
      let signalChanged = action.signal !== state.signals[action.dataset];
      return {
        ...state,
        reference: action.isReference ? action.dataset : state.reference,
        signals: {
          ...state.signals,
          [action.dataset]: action.signal,
        },
        samples: {
          ...state.samples,
          [action.dataset]: signalChanged ? [] : state.samples[action.dataset],
        },
      };
    case SYNC_OPTIONS_SET:
      return {
        ...state,
        options: {
          ...state.options,
          ...action.options,
        },
      };
    case SYNC_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };
    case SYNC_SAMPLES_SUCCESS:
      return {
        ...state,
        samples: {
          ...state.samples,
          [action.dataset]: action.samples,
        },
      };
    case SYNC_PARAMS_SET:
      let params = state.params[action.dataset] || initialParams;
      return {
        ...state,
        params: {
          ...state.params,
          [action.dataset]: {
            ...params,
            ...action.params,
          },
        },
      };
    case SYNC_PARAMS_REQUEST:
      return {
        ...state,
        error: null,
        isLoading: true,
        params: initialState.params,
        segments: initialState.segments,
      };
    case SYNC_PARAMS_SUCCESS:
      return {
        ...state,
        error: null,
        isLoading: false,
        params: action.params,
        segments: action.segments,
      };
    case SYNC_EXECUTE_REQUEST:
      return {
        ...state,
        error: null,
        isLoading: true,
      };
    case SYNC_EXECUTE_SUCCESS:
      return {
        ...state,
        error: null,
        isLoading: false,
        params: {},
      };
    default:
      return state;
  }
};

export default sync;
