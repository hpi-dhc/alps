import { all, take, put, call, race, delay, takeEvery, select } from 'redux-saga/effects';
import { normalize } from 'normalizr';
import { PROCESS_STATUS } from '../components/Common/StatusIcon';
import * as ActionTypes from '../constants/ActionTypes';
import * as Schemas from '../schemas';
import * as Datasets from '../api/datasets';
import * as Analysis from '../api/analysis';
import * as Signals from '../api/signals';
import { getDatasets, getAnalysisResults, getAllSignals } from '../selectors/data';

function * pollDataset (id) {
  let keepPolling = true;
  while (keepPolling) {
    try {
      yield delay(5000);
      const response = yield call(Datasets.get, id);
      const payload = normalize(response.data, Schemas.dataset);
      const dataset = payload.entities.datasets[id];
      const datasetsInStore = yield select(getDatasets);
      if (dataset.status !== datasetsInStore[id].status) {
        yield put({ type: ActionTypes.DATASET_GET_SUCCESS, payload });
      }
      keepPolling = ![PROCESS_STATUS.PROCESSED, PROCESS_STATUS.ERROR].includes(dataset.status);
    } catch (error) {
      const payload = error.response ? error.response.data : error;
      yield put({ type: ActionTypes.DATASET_FAILURE, payload });
    }
  }
}

function * pollAnalysis (id) {
  let keepPolling = true;
  while (keepPolling) {
    try {
      yield delay(1000);
      const response = yield call(Analysis.get, id);
      const payload = normalize(response.data, Schemas.analysisResult);
      const result = payload.entities.analysisResults[id];
      const resultsInStore = yield select(getAnalysisResults);
      if (result.process && result.process.status !== resultsInStore[id].process.status) {
        yield put({ type: ActionTypes.ANALYSIS_RESULT_GET_SUCCESS, payload });
      }
      keepPolling = !result.process || ![PROCESS_STATUS.PROCESSED, PROCESS_STATUS.ERROR].includes(result.process.status);
    } catch (error) {
      const payload = error.response ? error.response.data : error;
      yield put({ type: ActionTypes.ANALYSIS_RESULT_FAILURE, payload });
    }
  }
}

function * pollSignal (id) {
  let keepPolling = true;
  while (keepPolling) {
    try {
      yield delay(1000);
      const response = yield call(Signals.get, id);
      const payload = normalize(response.data, Schemas.signal);
      const result = payload.entities.signals[id];
      const resultsInStore = yield select(getAllSignals);
      if (result.process.status !== resultsInStore[id].process.status) {
        yield put({ type: ActionTypes.SIGNAL_GET_SUCCESS, payload });
      }
      keepPolling = ![PROCESS_STATUS.PROCESSED, PROCESS_STATUS.ERROR].includes(result.process.status);
    } catch (error) {
      const payload = error.response ? error.response.data : error;
      yield put({ type: ActionTypes.SIGNAL_GET_FAILURE, payload });
    }
  }
}

function * watchPolling (id, type) {
  let keepPolling = true;
  while (keepPolling) {
    const action = yield take(type);
    keepPolling = id !== action.id;
  }
}

function * startPolling (pollFunction, stopActionType, action) {
  yield race([
    call(pollFunction, action.id),
    call(watchPolling, action.id, stopActionType),
  ]);
}

export default function * pollingSaga () {
  yield all([
    takeEvery(ActionTypes.DATASET_START_POLLING, startPolling, pollDataset, ActionTypes.DATASET_STOP_POLLING),
    takeEvery(ActionTypes.ANALYSIS_RESULT_START_POLLING, startPolling, pollAnalysis, ActionTypes.ANALYSIS_RESULT_STOP_POLLING),
    takeEvery(ActionTypes.SIGNAL_START_POLLING, startPolling, pollSignal, ActionTypes.SIGNAL_STOP_POLLING),
  ]);
}
