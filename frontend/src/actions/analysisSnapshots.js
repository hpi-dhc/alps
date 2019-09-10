import {
  ANALYSIS_SNAPSHOT_LIST_REQUEST,
  ANALYSIS_SNAPSHOT_SELECT,
} from '../constants/ActionTypes';

// export const create = (name) => ({
//   type: ANALYSIS_LABEL_CREATE_REQUEST,
//   payload: {
//     name,
//   },
// });

export const list = () => ({
  type: ANALYSIS_SNAPSHOT_LIST_REQUEST,
});

export const select = (id) => ({
  type: ANALYSIS_SNAPSHOT_SELECT,
  id,
});
