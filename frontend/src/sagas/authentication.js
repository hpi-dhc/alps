import { all, takeEvery, put, call } from 'redux-saga/effects';
import { REHYDRATE } from 'redux-persist/lib/constants';
import { LOGIN_REQUEST, LOGOUT_REQUEST } from '../constants/ActionTypes';
import * as Actions from '../actions/authentication';
import { endpointArray } from '../api';
import * as Api from '../api/authentication';
import { getAuthenticationToken } from '../selectors/authentication';

function addAuthTokenToEndpoints (token) {
  endpointArray.forEach(endpoint => {
    endpoint.defaults.headers.common['Authorization'] = `Token ${token}`;
  });
}

function removeAuthTokenFromEndpoints () {
  endpointArray.forEach(endpoint => {
    delete endpoint.defaults.headers.common['Authorization'];
  });
}

function rehydrateAuthentication (action) {
  if (action.payload) {
    const token = getAuthenticationToken(action.payload);
    if (token) {
      addAuthTokenToEndpoints(token);
    }
  }
}

function * handleLoginRequest (action) {
  try {
    const { username, password } = action;
    const response = yield call(Api.requestToken, username, password);
    const token = response.data.key;
    addAuthTokenToEndpoints(token);
    yield put(Actions.receiveLogin(token));
  } catch (error) {
    console.log(error.response.data);
    yield put(Actions.loginError(error.response.data));
  }
}

function * handleLogoutRequest () {
  try {
    yield call(Api.requestLogout);
    removeAuthTokenFromEndpoints();
    yield put(Actions.receiveLogout());
  } catch (error) {
    yield put(Actions.logoutError(error.response.data));
  }
}

export default function * authenticationSaga () {
  yield all([
    takeEvery(LOGIN_REQUEST, handleLoginRequest),
    takeEvery(LOGOUT_REQUEST, handleLogoutRequest),
    takeEvery(REHYDRATE, rehydrateAuthentication),
  ]);
}
