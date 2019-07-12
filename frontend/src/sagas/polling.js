import { all, take, put, call, race, delay, takeEvery, select } from 'redux-saga/effects';
import { normalize } from 'normalizr';
import { PROCESS_STATUS } from '../components/Common/StatusIcon';
import * as ActionTypes from '../constants/ActionTypes';
import * as Schemas from '../schemas';
import * as Datasets from '../api/datasets';
import { getDatasets } from '../selectors/data';

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

function * watchStopDatasetPolling (id) {
  let keepPolling = true;
  while (keepPolling) {
    const action = yield take(ActionTypes.DATASET_STOP_POLLING);
    keepPolling = id !== action.id;
  }
}

function * startDatasetPolling (action) {
  yield race([
    call(pollDataset, action.id),
    call(watchStopDatasetPolling, action.id),
  ]);
}

export default function * pollingSaga () {
  yield all([
    takeEvery(ActionTypes.DATASET_START_POLLING, startDatasetPolling),
  ]);
}
