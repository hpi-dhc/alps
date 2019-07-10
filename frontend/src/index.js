import React from 'react'
import ReactDOM from 'react-dom'
import Root from './Root'
import configureStore from './configureStore'

const { store, persistor } = configureStore()

if (module.hot) {
  module.hot.accept()
}

ReactDOM.render(
  <Root store={store} persistor={persistor} />,
  document.getElementById('root')
)
