import { combineReducers } from 'redux';
import { LOGOUT_SUCCESS } from '../constants/ActionTypes';
import app from './app';
import authentication from './authentication';
import data from './data';
import plots from './plots';

const rootReducer = combineReducers({
  app,
  authentication,
  data,
  plots,
});

const initialState = rootReducer({}, {});

export default (state, action) => {
  if (action.type === LOGOUT_SUCCESS) {
    state = initialState;
  }

  return rootReducer(state, action);
};
