import {
  ANALYSIS_LABEL_SELECT,
  ANALYSIS_SNAPSHOT_SELECT,
  ANALYSIS_METHOD_CONFIG_SET,
  ANALYSIS_METHOD_ADD,
  ANALYSIS_METHOD_REMOVE,
  ANALYSIS_SIGNAL_ADD,
  ANALYSIS_SIGNAL_REMOVE,
  ANALYSIS_RESET,
} from '../constants/ActionTypes';

const initialState = {
  selectedSnapshot: null,
  selectedLabel: null,
  selectedSignals: [],
  selectedMethods: [],
  methodConfigurations: {},
};

const analysis = (state = initialState, action) => {
  switch (action.type) {
    case ANALYSIS_RESET:
      return initialState;
    case ANALYSIS_SIGNAL_ADD:
      return {
        ...state,
        selectedSignals: [...state.selectedSignals, action.id],
      };
    case ANALYSIS_SIGNAL_REMOVE:
      return {
        ...state,
        selectedSignals: state.selectedSignals.filter(each => each !== action.id),
      };
    case ANALYSIS_METHOD_ADD:
      return {
        ...state,
        selectedMethods: [...state.selectedMethods, action.id],
      };
    case ANALYSIS_METHOD_REMOVE:
      return {
        ...state,
        selectedMethods: state.selectedMethods.filter(each => each !== action.id),
      };
    case ANALYSIS_LABEL_SELECT:
      return {
        ...state,
        selectedLabel: action.id,
      };
    case ANALYSIS_SNAPSHOT_SELECT:
      return {
        ...state,
        selectedSnapshot: action.id,
      };
    case ANALYSIS_METHOD_CONFIG_SET:
      return {
        ...state,
        methodConfigurations: {
          ...state.methodConfigurations,
          [action.method]: {
            ...state.methodConfigurations[action.method],
            [action.key]: action.value,
          },
        },
      };
    default:
      return state;
  }
};

export default analysis;
