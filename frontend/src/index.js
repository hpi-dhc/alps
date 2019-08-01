import 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import Root from './Root';
import configureStore from './configureStore';

const { store, persistor } = configureStore();

ReactDOM.render(
  <Root store={store} persistor={persistor} />,
  document.getElementById('root')
);
