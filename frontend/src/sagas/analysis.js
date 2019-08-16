import { all, put, call, select, throttle } from 'redux-saga/effects';
import { normalize } from 'normalizr';
import * as ActionTypes from '../constants/ActionTypes';
import * as Schemas from '../schemas';
import * as Api from '../api/analysis';
import { getMethodConfigurations, getSelectedMethods, getSelectedLabel, getSelectedSignals } from '../selectors/analysis';

function * handleRunAnalysis (action) {
  try {
    const label = yield select(getSelectedLabel);
    const signals = yield select(getSelectedSignals);
    const methods = yield select(getSelectedMethods);
    const configurations = yield select(getMethodConfigurations);
    const payload = methods.reduce((arr, method) => ([
      ...arr,
      ...signals.map(signal => ({
        label,
        signal,
        method,
        configuration: configurations[method],
      })),
    ]), []);
    const response = yield call(Api.create, payload);
    const data = normalize(response.data, [Schemas.analysisResult]);
    yield put({ type: ActionTypes.ANALYSIS_RESULT_CREATE_SUCCESS, payload: data });
  } catch (error) {
    yield put({ type: ActionTypes.ANALYSIS_RESULT_FAILURE, payload: error });
  }
}

export default function * analysisSaga () {
  yield all([
    throttle(2500, ActionTypes.ANALYSIS_RUN, handleRunAnalysis),
  ]);
}
