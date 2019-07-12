import {
  APP_SET_TITLE,
} from '../constants/ActionTypes';

const initialState = {
  title: '',
};

const app = (state = initialState, action) => {
  switch (action.type) {
    case APP_SET_TITLE:
      return {
        ...state,
        title: action.title,
      };
    default:
      return state;
  }
};

export default app;
