import {
  DATASET_LIST_REQUEST,
  DATASET_LIST_SUCCESS,
  DATASET_CREATE_REQUEST,
  DATASET_CREATE_SUCCESS,
  DATASET_FAILURE
} from '../constants/ActionTypes'

export const requestDatasetList = (sessionId) => ({
  type: DATASET_LIST_REQUEST,
  sessionId
})

export const receiveDatasetList = (payload) => ({
  type: DATASET_LIST_SUCCESS,
  payload
})

export const createDataset = (payload) => ({
  type: DATASET_CREATE_REQUEST,
  payload
})

export const receiveCreatedDataset = (payload) => ({
  type: DATASET_CREATE_SUCCESS,
  payload
})

export const datasetError = (message) => ({
  type: DATASET_FAILURE,
  message
})
