import {
  SOURCE_LIST_REQUEST,
  SOURCE_LIST_SUCCESS,
  SOURCE_FAILURE
} from '../constants/ActionTypes'

export const requestSourceList = () => ({
  type: SOURCE_LIST_REQUEST
})

export const receiveSourceList = (payload) => ({
  type: SOURCE_LIST_SUCCESS,
  payload
})

export const sourceError = (message) => ({
  type: SOURCE_FAILURE,
  message
})
