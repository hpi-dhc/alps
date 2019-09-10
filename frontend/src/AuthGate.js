import { hot } from 'react-hot-loader/root';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import { isAuthenticated } from './selectors/authentication';
import {
  SOURCE_LIST_REQUEST,
  ANALYSIS_LABEL_LIST_REQUEST,
  PROCESSINGMETHOD_LIST_REQUEST,
} from './constants/ActionTypes';

import App from './screens/App';
import Login from './screens/Login';

class AuthGate extends Component {
  static propTypes = {
    initApp: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired,
  }

  componentDidMount () {
    if (this.props.isAuthenticated) {
      this.props.initApp();
    } else if (this.props.history.location.pathname !== '/') {
      this.props.history.push('/');
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.isAuthenticated && nextProps.isAuthenticated) {
      nextProps.initApp();
    } else if (this.props.isAuthenticated && !nextProps.isAuthenticated) {
      this.props.history.push('/');
    }
  }

  render () {
    return (
      <Route
        path='/'
        render={props =>
          this.props.isAuthenticated ? (
            <App />
          ) : (
            <Login />
          )
        }
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isAuthenticated: isAuthenticated(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    initApp: () => {
      dispatch({ type: SOURCE_LIST_REQUEST });
      dispatch({ type: ANALYSIS_LABEL_LIST_REQUEST });
      dispatch({ type: PROCESSINGMETHOD_LIST_REQUEST });
    },
  };
};

export default hot(connect(mapStateToProps, mapDispatchToProps)(AuthGate));
