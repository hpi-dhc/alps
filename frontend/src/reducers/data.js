import {
  SUBJECT_LIST_SUCCESS,
  SESSION_GET_SUCCESS,
  DATASET_GET_SUCCESS,
  SUBJECT_CREATE_SUCCESS,
  SESSION_CREATE_SUCCESS,
  DATASET_CREATE_SUCCESS,
  SUBJECT_GET_SUCCESS,
  SOURCE_LIST_SUCCESS,
  SESSION_DESTROY_SUCCESS,
  SUBJECT_DESTROY_SUCCESS,
  DATASET_DESTROY_SUCCESS,
} from '../constants/ActionTypes';
import { filterObjectByValue } from '../utils';

const initialState = {
  isLoading: false,
  error: null,
  sources: {},
  subjects: {},
  sessions: {},
  datasets: {},
  signals: {},
  rawFiles: {},
};

const data = (state = initialState, action) => {
  let newState = state;

  if (action.type && action.type.match(/^hrv\/data\/[A-Z_]+_SUCCESS$/g)) {
    newState = {
      ...newState,
      isLoading: false,
      error: null,
    };
  }

  if (action.type && action.type.match(/^hrv\/data\/[A-Z_]+_FAILURE$/g)) {
    newState = {
      ...newState,
      isLoading: false,
      error: action.payload.error,
    };
  }

  if (action.type && action.type.match(/^hrv\/data\/[A-Z_]+_REQUEST$/g)) {
    newState = {
      ...newState,
      isLoading: true,
      error: null,
    };
  }

  switch (action.type) {
    case SOURCE_LIST_SUCCESS:
      return {
        ...newState,
        sources: {
          ...state.sources,
          ...action.payload.entities.sources,
        },
      };
    case SUBJECT_GET_SUCCESS:
      return {
        ...newState,
        subjects: {
          ...state.subjects,
          ...action.payload.entities.subjects,
        },
        sessions: {
          ...state.sessions,
          ...action.payload.entities.sessions,
        },
      };
    case SUBJECT_DESTROY_SUCCESS:
      const subjects = filterObjectByValue(newState.subjects, ({ id }) => id !== action.id);
      return {
        ...newState,
        subjects,
      };
    case SUBJECT_LIST_SUCCESS:
    case SUBJECT_CREATE_SUCCESS:
      return {
        ...newState,
        subjects: {
          ...state.subjects,
          ...action.payload.entities.subjects,
        },
      };
    case SESSION_CREATE_SUCCESS: {
      const session = action.payload.entities.sessions[action.payload.result];
      newState.subjects[session.subject].sessions.unshift(session.id);
      return {
        ...newState,
        subjects: {
          ...newState.subjects,
        },
        sessions: {
          ...state.sessions,
          ...action.payload.entities.sessions,
        },
      };
    }
    case SESSION_DESTROY_SUCCESS: {
      const session = newState.sessions[action.id];
      const subject = newState.subjects[session.subject];
      const sessions = filterObjectByValue(newState.sessions, ({ id }) => id !== session.id);
      const datasets = filterObjectByValue(newState.datasets, ({ id }) => !session.datasets.includes(id));
      // TODO: Cleanup signals and files and move to external function
      return {
        ...newState,
        subjects: {
          ...newState.subjects,
          [subject.id]: {
            ...subject,
            sessions: subject.sessions.filter(each => each !== session.id),
          },
        },
        sessions,
        datasets,
      };
    }
    case SESSION_GET_SUCCESS:
      return {
        ...newState,
        sessions: {
          ...state.sessions,
          ...action.payload.entities.sessions,
        },
        datasets: {
          ...state.datasets,
          ...action.payload.entities.datasets,
        },
        signals: {
          ...state.signals,
          ...action.payload.entities.signals,
        },
        rawFiles: {
          ...state.rawFiles,
          ...action.payload.entities.rawFiles,
        },
      };
    case DATASET_CREATE_SUCCESS: {
      const dataset = action.payload.entities.datasets[action.payload.result];
      newState.sessions[dataset.session].datasets.unshift(dataset.id);
      return {
        ...newState,
        sessions: {
          ...newState.sessions,
        },
        datasets: {
          ...state.datasets,
          ...action.payload.entities.datasets,
        },
        rawFiles: {
          ...state.rawFiles,
          ...action.payload.entities.rawFiles,
        },
      };
    }
    case DATASET_GET_SUCCESS:
      return {
        ...newState,
        datasets: {
          ...state.datasets,
          ...action.payload.entities.datasets,
        },
        signals: {
          ...state.signals,
          ...action.payload.entities.signals,
        },
        rawFiles: {
          ...state.rawFiles,
          ...action.payload.entities.rawFiles,
        },
      };
    case DATASET_DESTROY_SUCCESS: {
      const sessionId = newState.datasets[action.id].session;
      newState.sessions[sessionId].datasets = newState.sessions[sessionId].datasets.filter(id => id !== action.id);
      const datasets = filterObjectByValue(newState.datasets, each => each.id !== action.id);
      return {
        ...newState,
        sessions: {
          ...newState.sessions,
        },
        datasets,
      };
    }
    default:
      return newState;
  }
};

export default data;
