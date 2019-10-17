import { all, put, call, spawn, select, throttle, takeEvery, debounce } from 'redux-saga/effects';
import * as ActionTypes from '../constants/ActionTypes';
import * as Api from '../api/sync';
import * as SignalApi from '../api/signals';
import { getSelectedSignals, getReference, getParams, getDomain, getReferenceDate, getOptions } from '../selectors/sync';

function * handleParametersRequest (action) {
  try {
    const signals = yield select(getSelectedSignals);
    const signalIds = Object.values(signals).filter(each => Boolean(each));
    const signalToDataset = Object.entries(signals).reduce((object, [dataset, signal]) => ({
      ...object,
      [signal]: dataset,
    }), {});

    const reference = yield select(getReference);
    const referenceSignal = signals[reference];

    const options = yield select(getOptions);
    for (let option of Object.keys(options)) {
      options[option] = Number(options[option]);
    };

    const response = yield call(Api.getParams, referenceSignal, signalIds, options);
    const params = Object.entries(response.data.params).reduce((object, [signal, values]) => ({
      ...object,
      [signalToDataset[signal]]: values,
    }), {});

    yield put({
      type: ActionTypes.SYNC_PARAMS_SUCCESS,
      params,
      segments: response.data.segments,
    });
  } catch (error) {
    yield put({ type: ActionTypes.SYNC_ERROR, error: error });
  }
}

function * handleExecuteRequest (action) {
  console.log('Sync request', action);
  try {
    yield call(Api.sync, action.referenceTime, action.params);
    yield put({ type: ActionTypes.SYNC_EXECUTE_SUCCESS });
  } catch (error) {
    yield put({ type: ActionTypes.SYNC_ERROR, error: error });
  }
}

function * handleSignalChange (action) {
  const signals = yield select(getSelectedSignals);
  for (let [dataset, signal] of Object.entries(signals)) {
    if (dataset === action.dataset) {
      yield spawn(handleSamplesRequest, action);
    } else {
      yield spawn(handleSamplesRequest, { dataset, signal });
    }
  }
}

function * handleDomainChange (action) {
  const signals = yield select(getSelectedSignals);
  for (let [dataset, signal] of Object.entries(signals)) {
    yield spawn(
      handleSamplesRequest,
      {
        dataset,
        signal,
        domain: action.domain,
      },
    );
  }
};

function * handleSamplesRequest (action) {
  try {
    const referenceDate = yield select(getReferenceDate);

    let signal = action.signal;
    console.log(signal);
    if (!signal) {
      const selectedSignals = yield select(getSelectedSignals);
      signal = selectedSignals[action.dataset];
      console.log(selectedSignals, signal);
    }

    let domain = yield select(getDomain);
    if (action.domain) {
      domain = action.domain;
    }

    let params = yield select(getParams);
    params = params[action.dataset] || {};
    if (action.params) {
      params = {
        ...params,
        ...action.params,
      };
    }

    const response = yield call(
      SignalApi.requestSamples,
      signal,
      domain,
      500,
      true,
      params ? params.stretchFactor : undefined,
      params ? params.timeshift : undefined,
      referenceDate ? referenceDate.toISOString() : undefined,
    );

    yield put({
      type: ActionTypes.SYNC_SAMPLES_SUCCESS,
      dataset: action.dataset,
      samples: response.data.data,
    });
  } catch (error) {
    yield put({ type: ActionTypes.SYNC_ERROR, error });
  }
}

export default function * syncSaga () {
  yield all([
    throttle(2500, ActionTypes.SYNC_PARAMS_REQUEST, handleParametersRequest),
    throttle(2500, ActionTypes.SYNC_EXECUTE_REQUEST, handleExecuteRequest),
    debounce(1000, ActionTypes.SYNC_PARAMS_SET, handleSamplesRequest),
    takeEvery(ActionTypes.SYNC_SIGNAL_SET, handleSignalChange),
    takeEvery(ActionTypes.SYNC_DOMAIN_SET, handleDomainChange),
  ]);
}
