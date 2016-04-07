import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import App from './components/App.jsx'
import appReducer from './reducers/index'
import normalize from 'normalize.css'
import milligram from 'milligram'

const loggerMiddleware = createLogger()
const store = createStore(
  appReducer,
  applyMiddleware(
    thunkMiddleware,
    // loggerMiddleware
  )
)

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
)
