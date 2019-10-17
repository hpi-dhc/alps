import { all, put, call, select, throttle, takeEvery } from 'redux-saga/effects';
import { normalize } from 'normalizr';
import FileDownload from 'js-file-download';
import * as ActionTypes from '../constants/ActionTypes';
import * as Schemas from '../schemas';
import * as Api from '../api/analysis';
import * as AnalysisSnapshots from '../actions/analysisSnapshots';
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
    yield put(AnalysisSnapshots.select(null));
  } catch (error) {
    yield put({ type: ActionTypes.ANALYSIS_RESULT_FAILURE, payload: error });
  }
}

function * handleExportRequest (action) {
  const response = yield call(Api.exportResults, action.payload.sessions, action.payload.labels);
  FileDownload(response.data, 'results.csv');
}

export default function * analysisSaga () {
  yield all([
    throttle(2500, ActionTypes.ANALYSIS_RUN, handleRunAnalysis),
    takeEvery(ActionTypes.ANALYSIS_RESULT_EXPORT_REQUEST, handleExportRequest),
  ]);
}
