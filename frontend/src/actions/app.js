import {
  APP_SET_TITLE
} from '../constants/ActionTypes'

export const setAppTitle = (title) => ({
  type: APP_SET_TITLE,
  title
})
