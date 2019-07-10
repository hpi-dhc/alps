import { all } from 'redux-saga/effects';
import authentication from './authentication';

export default function * rootSaga () {
  yield all([
    authentication(),
  ]);
}
