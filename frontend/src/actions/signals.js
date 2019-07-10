import {
  SAMPLES_FAILURE,
  SAMPLES_GET_REQUEST,
  SAMPLES_GET_SUCCESS
} from '../constants/ActionTypes'

export const requestSamples = (id, from, to) => ({
  type: SAMPLES_GET_REQUEST,
  id,
  from,
  to
})

export const receiveSamples = (payload) => ({
  type: SAMPLES_GET_SUCCESS,
  payload
})

export const samplesError = (error) => ({
  type: SAMPLES_FAILURE,
  error
})
