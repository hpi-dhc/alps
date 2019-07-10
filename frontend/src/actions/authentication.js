import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE
} from '../constants/ActionTypes'

export const requestLogin = (username, password) => ({
  type: LOGIN_REQUEST,
  username,
  password
})

export const receiveLogin = (token) => ({
  type: LOGIN_SUCCESS,
  token
})

export const loginError = (message) => ({
  type: LOGIN_FAILURE,
  message
})

export const requestLogout = () => ({
  type: LOGOUT_REQUEST
})

export const receiveLogout = () => ({
  type: LOGOUT_SUCCESS
})

export const logoutError = (message) => ({
  type: LOGOUT_FAILURE,
  message
})
