import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE
} from '../constants/ActionTypes';

const initialState = {
  isFetching: false,
  token: null,
  errorMessage: ''
};

const authentication = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        isFetching: false,
        token: action.token,
        errorMessage: ''
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        isFetching: false,
        token: null,
        errorMessage: action.message
      };
    case LOGOUT_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        isFetching: false,
        token: null,
        errorMessage: ''
      };
    case LOGOUT_FAILURE:
      return {
        ...state,
        isFetching: false,
        errorMessage: action.message
      };
    default:
      return state;
  }
};

export default authentication;
