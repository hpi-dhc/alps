import {
  SESSION_GET_REQUEST,
  SESSION_GET_SUCCESS,
  SESSION_FAILURE,
  SESSION_CREATE_REQUEST,
  SESSION_CREATE_SUCCESS
} from '../constants/ActionTypes'

export const requestSession = (id) => ({
  type: SESSION_GET_REQUEST,
  id
})

export const receiveSession = (payload) => ({
  type: SESSION_GET_SUCCESS,
  payload
})

export const sessionError = (message) => ({
  type: SESSION_FAILURE,
  message
})

export const createSession = (payload) => ({
  type: SESSION_CREATE_REQUEST,
  payload
})

export const receiveCreatedSession = (payload) => ({
  type: SESSION_CREATE_SUCCESS,
  payload
})
