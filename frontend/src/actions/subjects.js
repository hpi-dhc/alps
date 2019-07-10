import {
  SUBJECT_FAILURE,
  SUBJECT_LIST_REQUEST,
  SUBJECT_LIST_SUCCESS,
  SUBJECT_CREATE_REQUEST,
  SUBJECT_CREATE_SUCCESS
} from '../constants/ActionTypes'

export const subjectsError = (message) => ({
  type: SUBJECT_FAILURE,
  message
})

export const requestSubjects = () => ({
  type: SUBJECT_LIST_REQUEST
})

export const receiveSubjects = (payload) => ({
  type: SUBJECT_LIST_SUCCESS,
  payload
})

export const createSubject = (payload) => ({
  type: SUBJECT_CREATE_REQUEST,
  payload
})

export const receiveCreatedSubject = (payload) => ({
  type: SUBJECT_CREATE_SUCCESS,
  payload
})
