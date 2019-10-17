import { all, put, call, select, throttle } from 'redux-saga/effects';
import { normalize } from 'normalizr';
import * as ActionTypes from '../constants/ActionTypes';
import * as Schemas from '../schemas';
import * as Api from '../api/signals';
import * as Plots from '../actions/plots';
import { getItems } from '../selectors/plots';

function * handleFilter (action) {
  try {
    const { session, signal, filter, configuration } = action.payload;
    const response = yield call(Api.filter, signal, filter, configuration);
    const data = normalize(response.data, Schemas.signal);
    yield put({ type: ActionTypes.SIGNAL_FILTER_SUCCESS, payload: data });
    const plots = yield select((state) => getItems(state)[session]);
    console.log('plots', plots);
    if (plots) {
      const filteredSignal = data.entities.signals[data.result];
      yield put(Plots.upsert(
        session,
        {
          id: plots.mainPlot,
          dataset: filteredSignal.dataset,
          signal: filteredSignal.id,
        },
      ));
    }
  } catch (error) {
    yield put({ type: ActionTypes.SIGNAL_FILTER_ERROR, payload: error });
  }
}

export default function * analysisSaga () {
  yield all([
    throttle(2500, ActionTypes.SIGNAL_FILTER_REQUEST, handleFilter),
  ]);
}
