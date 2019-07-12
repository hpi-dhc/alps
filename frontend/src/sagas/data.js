import { all, takeEvery, put, call } from 'redux-saga/effects';
import { normalize } from 'normalizr';
import * as Schemas from '../schemas';
import * as ActionTypes from '../constants/ActionTypes';
import * as Sources from '../api/sources';
import * as Subjects from '../api/subjects';
import * as Sessions from '../api/sessions';
import * as Datasets from '../api/datasets';

function * handleSourceListRequest (action) {
  try {
    const response = yield call(Sources.list);
    const payload = normalize(response.data, [Schemas.source]);
    yield put({ type: ActionTypes.SOURCE_LIST_SUCCESS, payload });
  } catch (error) {
    console.log(error);
    const payload = error.response.data;
    yield put({ type: ActionTypes.SOURCE_FAILURE, payload });
  }
}

// Subject sagas

function * handleSubjectGetRequest (action) {
  try {
    const response = yield call(Subjects.get, action.id);
    const payload = normalize(response.data, Schemas.subject);
    yield put({ type: ActionTypes.SUBJECT_GET_SUCCESS, payload });
  } catch (error) {
    console.log(error);
    const payload = error.response.data;
    yield put({ type: ActionTypes.SUBJECT_FAILURE, payload });
  }
}

function * handleSubjectListRequest (action) {
  try {
    const response = yield call(Subjects.list);
    const payload = normalize(response.data, [Schemas.subject]);
    yield put({ type: ActionTypes.SUBJECT_LIST_SUCCESS, payload });
  } catch (error) {
    console.log(error);
    const payload = error.response.data;
    yield put({ type: ActionTypes.SUBJECT_FAILURE, payload });
  }
}

function * handleSubjectCreateRequest (action) {
  try {
    const response = yield call(Subjects.create, action.payload);
    const payload = normalize(response.data, Schemas.subject);
    yield put({ type: ActionTypes.SUBJECT_CREATE_SUCCESS, payload });
  } catch (error) {
    console.log(error);
    const payload = error.response.data;
    yield put({ type: ActionTypes.SUBJECT_FAILURE, payload });
  }
}

// Session sagas

function * handleSessionListRequest (action) {
  try {
    const response = yield call(Sessions.list, action.subjectId);
    const payload = normalize(response.data, [Schemas.session]);
    yield put({ type: ActionTypes.SESSION_LIST_SUCCESS, payload });
  } catch (error) {
    console.log(error);
    const payload = error.response.data;
    yield put({ type: ActionTypes.SESSION_FAILURE, payload });
  }
}

function * handleSessionGetRequest (action) {
  try {
    const response = yield call(Sessions.get, action.id);
    const payload = normalize(response.data, Schemas.session);
    yield put({ type: ActionTypes.SESSION_GET_SUCCESS, payload });
  } catch (error) {
    console.log(error);
    const payload = error.response.data;
    yield put({ type: ActionTypes.SESSION_FAILURE, payload });
  }
}

function * handleSessionCreateRequest (action) {
  try {
    const { subject, ...data } = action.payload;
    const response = yield call(Sessions.create, subject, data);
    const payload = normalize(response.data, Schemas.session);
    yield put({ type: ActionTypes.SESSION_CREATE_SUCCESS, payload });
  } catch (error) {
    console.log(error);
    const payload = error.response.data;
    yield put({ type: ActionTypes.SESSION_FAILURE, payload });
  }
}

function * handleSessionDestroyRequest (action) {
  try {
    const { id } = action;
    yield call(Sessions.destroy, id);
    yield put({ type: ActionTypes.SESSION_DESTROY_SUCCESS, id });
  } catch (error) {
    console.log(error);
    const payload = error.response.data;
    yield put({ type: ActionTypes.SESSION_FAILURE, payload });
  }
}

// Dataset sagas

function * handleDatasetGetRequest (action) {
  try {
    const response = yield call(Datasets.get, action.id);
    const payload = normalize(response.data, Schemas.dataset);
    yield put({ type: ActionTypes.DATASET_GET_SUCCESS, payload });
  } catch (error) {
    console.log(error);
    const payload = error.response.data;
    yield put({ type: ActionTypes.DATASET_FAILURE, payload });
  }
}

function * handleDatasetCreateRequest (action) {
  try {
    const { subject, files, ...data } = action.payload;
    const response = yield call(Datasets.create, subject, data);
    const payload = normalize(response.data, Schemas.dataset);
    const filesResponse = yield call(Datasets.uploadFiles, payload.result, files);
    const filesNormalized = normalize(filesResponse, [Schemas.rawFile]);
    payload.entities = {
      ...payload.entities,
      ...filesNormalized.entities,
    };
    yield put({ type: ActionTypes.DATASET_CREATE_SUCCESS, payload });
  } catch (error) {
    console.log(error);
    const payload = error.response.data;
    yield put({ type: ActionTypes.DATASET_FAILURE, payload });
  }
}

function * handleDatasetDestroyRequest (action) {
  try {
    const { id } = action;
    yield call(Datasets.destroy, id);
    yield put({ type: ActionTypes.DATASET_DESTROY_SUCCESS, id });
  } catch (error) {
    console.log(error);
    const payload = error.response.data;
    yield put({ type: ActionTypes.DATASET_FAILURE, payload });
  }
}

export default function * dataSaga () {
  yield all([
    takeEvery(ActionTypes.SOURCE_LIST_REQUEST, handleSourceListRequest),
    takeEvery(ActionTypes.SUBJECT_GET_REQUEST, handleSubjectGetRequest),
    takeEvery(ActionTypes.SUBJECT_LIST_REQUEST, handleSubjectListRequest),
    takeEvery(ActionTypes.SUBJECT_CREATE_REQUEST, handleSubjectCreateRequest),
    takeEvery(ActionTypes.SESSION_GET_REQUEST, handleSessionGetRequest),
    takeEvery(ActionTypes.SESSION_LIST_REQUEST, handleSessionListRequest),
    takeEvery(ActionTypes.SESSION_CREATE_REQUEST, handleSessionCreateRequest),
    takeEvery(ActionTypes.SESSION_DESTROY_REQUEST, handleSessionDestroyRequest),
    takeEvery(ActionTypes.DATASET_GET_REQUEST, handleDatasetGetRequest),
    takeEvery(ActionTypes.DATASET_CREATE_REQUEST, handleDatasetCreateRequest),
    takeEvery(ActionTypes.DATASET_DESTROY_REQUEST, handleDatasetDestroyRequest),
  ]);
}
