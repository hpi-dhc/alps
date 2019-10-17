import { all } from 'redux-saga/effects';
import authentication from './authentication';
import data from './data';
import preprocess from './preprocess';
import analysis from './analysis';
import sync from './sync';
import polling from './polling';

export default function * rootSaga () {
  yield all([
    authentication(),
    data(),
    preprocess(),
    analysis(),
    sync(),
    polling(),
  ]);
}
