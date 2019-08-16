import { all, takeEvery, put, call } from 'redux-saga/effects';
import { normalize } from 'normalizr';
import * as Schemas from '../schemas';
import * as ActionTypes from '../constants/ActionTypes';
import * as Sources from '../api/sources';
import * as ProcessingMethods from '../api/processingMethods';
import * as Subjects from '../api/subjects';
import * as Sessions from '../api/sessions';
import * as Datasets from '../api/datasets';
import * as AnalysisLabels from '../api/analysisLabels';
import * as AnalysisSamples from '../api/analysisSamples';
import * as Analysis from '../api/analysis';

function * handleSourceListRequest (action) {
  try {
    const response = yield call(Sources.list);
    const payload = normalize(response.data, [Schemas.source]);
    yield put({ type: ActionTypes.SOURCE_LIST_SUCCESS, payload });
  } catch (error) {
    console.log(error);
    const payload = error.response;
    yield put({ type: ActionTypes.SOURCE_FAILURE, payload });
  }
}

function * handleProcessingMethodListRequest (action) {
  try {
    const response = yield call(ProcessingMethods.list);
    const payload = normalize(response.data, [Schemas.processingMethod]);
    yield put({ type: ActionTypes.PROCESSINGMETHOD_LIST_SUCCESS, payload });
  } catch (error) {
    console.log(error);
    const payload = error.response;
    yield put({ type: ActionTypes.PROCESSINGMETHOD_FAILURE, payload });
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
    const payload = error.response;
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
    const payload = error.response;
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
    const payload = error.response;
    yield put({ type: ActionTypes.SUBJECT_FAILURE, payload });
  }
}

function * handleSubjectDestroyRequest (action) {
  try {
    const { id } = action;
    yield call(Subjects.destroy, id);
    yield put({ type: ActionTypes.SUBJECT_DESTROY_SUCCESS, id });
  } catch (error) {
    console.log(error);
    const payload = error.response;
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
    const payload = error.response;
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
    const payload = error.response;
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
    const payload = error.response;
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
    const payload = error.response;
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
    const payload = error.response;
    yield put({ type: ActionTypes.DATASET_FAILURE, payload });
  }
}

function * handleDatasetCreateRequest (action) {
  try {
    const { session, files, ...data } = action.payload;
    const response = yield call(Datasets.create, session, data);
    const payload = normalize(response.data, Schemas.dataset);
    const filesResponse = yield call(Datasets.uploadFiles, payload.result, files);
    const filesNormalized = normalize(filesResponse.data, [Schemas.rawFile]);
    payload.entities = {
      ...payload.entities,
      ...filesNormalized.entities,
    };
    yield put({ type: ActionTypes.DATASET_CREATE_SUCCESS, payload });
  } catch (error) {
    console.log(error);
    const payload = error.response;
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
    const payload = error.response;
    yield put({ type: ActionTypes.DATASET_FAILURE, payload });
  }
}

// Analysis Labels

function * handleAnalysisLabelListRequest (action) {
  try {
    const response = yield call(AnalysisLabels.list);
    const payload = normalize(response.data, [Schemas.analysisLabel]);
    yield put({ type: ActionTypes.ANALYSIS_LABEL_LIST_SUCCESS, payload });
  } catch (error) {
    console.log(error);
    const payload = error.response;
    yield put({ type: ActionTypes.ANALYSIS_LABEL_FAILURE, payload });
  }
}

// Analysis Samples

function * handleAnalysisSampleRequest (action) {
  try {
    let payload = action.payload;
    if (action.isNewLabel) {
      const labelResponse = yield call(AnalysisLabels.create, payload.label);
      const labelData = normalize(labelResponse.data, Schemas.analysisLabel);
      yield put({ type: ActionTypes.ANALYSIS_LABEL_CREATE_SUCCESS, payload: labelData });
      payload.label = labelData.result;
    }
    const sampleResponse = yield call(AnalysisSamples.create, action.session, payload.label, payload.start, payload.end);
    const sampleData = normalize(sampleResponse.data, Schemas.analysisSample);
    yield put({ type: ActionTypes.ANALYSIS_SAMPLE_CREATE_SUCCESS, payload: sampleData });
  } catch (error) {
    console.log(error);
    const payload = error.response;
    yield put({ type: ActionTypes.ANALYSIS_SAMPLE_FAILURE, payload });
  }
}

function * handleAnalysisSampleUpdateRequest (action) {
  try {
    const { id, payload } = action;
    const response = yield call(AnalysisSamples.update, id, payload);
    const result = normalize(response.data, Schemas.analysisSample);
    yield put({ type: ActionTypes.ANALYSIS_SAMPLE_UPDATE_SUCCESS, payload: result });
  } catch (error) {
    console.log(error);
    const payload = error.response;
    yield put({ type: ActionTypes.ANALYSIS_SAMPLE_FAILURE, payload });
  }
}

function * handleAnalysisSampleDestroyRequest (action) {
  try {
    const { id } = action;
    yield call(AnalysisSamples.destroy, id);
    yield put({ type: ActionTypes.ANALYSIS_SAMPLE_DESTROY_SUCCESS, id });
  } catch (error) {
    console.log(error);
    const payload = error.response;
    yield put({ type: ActionTypes.ANALYSIS_SAMPLE_FAILURE, payload });
  }
}

function * handleAnalysisResultListRequest (action) {
  try {
    const { session } = action;
    const response = yield call(Analysis.list, session);
    const result = normalize(response.data, [Schemas.analysisResult]);
    yield put({ type: ActionTypes.ANALYSIS_RESULT_LIST_SUCCESS, payload: result });
  } catch (error) {
    console.log(error);
    const payload = error.response;
    yield put({ type: ActionTypes.ANALYSIS_RESULT_FAILURE, payload });
  }
}

export default function * dataSaga () {
  yield all([
    takeEvery(ActionTypes.PROCESSINGMETHOD_LIST_REQUEST, handleProcessingMethodListRequest),
    takeEvery(ActionTypes.SOURCE_LIST_REQUEST, handleSourceListRequest),
    takeEvery(ActionTypes.SUBJECT_GET_REQUEST, handleSubjectGetRequest),
    takeEvery(ActionTypes.SUBJECT_LIST_REQUEST, handleSubjectListRequest),
    takeEvery(ActionTypes.SUBJECT_CREATE_REQUEST, handleSubjectCreateRequest),
    takeEvery(ActionTypes.SUBJECT_DESTROY_REQUEST, handleSubjectDestroyRequest),
    takeEvery(ActionTypes.SESSION_GET_REQUEST, handleSessionGetRequest),
    takeEvery(ActionTypes.SESSION_LIST_REQUEST, handleSessionListRequest),
    takeEvery(ActionTypes.SESSION_CREATE_REQUEST, handleSessionCreateRequest),
    takeEvery(ActionTypes.SESSION_DESTROY_REQUEST, handleSessionDestroyRequest),
    takeEvery(ActionTypes.DATASET_GET_REQUEST, handleDatasetGetRequest),
    takeEvery(ActionTypes.DATASET_CREATE_REQUEST, handleDatasetCreateRequest),
    takeEvery(ActionTypes.DATASET_DESTROY_REQUEST, handleDatasetDestroyRequest),
    takeEvery(ActionTypes.ANALYSIS_LABEL_LIST_REQUEST, handleAnalysisLabelListRequest),
    takeEvery(ActionTypes.ANALYSIS_SAMPLE_CREATE_REQUEST, handleAnalysisSampleRequest),
    takeEvery(ActionTypes.ANALYSIS_SAMPLE_UPDATE_REQUEST, handleAnalysisSampleUpdateRequest),
    takeEvery(ActionTypes.ANALYSIS_SAMPLE_DESTROY_REQUEST, handleAnalysisSampleDestroyRequest),
    takeEvery(ActionTypes.ANALYSIS_RESULT_LIST_REQUEST, handleAnalysisResultListRequest),
  ]);
}
