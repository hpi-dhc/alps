import { all } from 'redux-saga/effects';
import authentication from './authentication';
import data from './data';
import polling from './polling';

export default function * rootSaga () {
  yield all([
    authentication(),
    data(),
    polling(),
  ]);
}
