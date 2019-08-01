import { hot } from 'react-hot-loader/root';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import { isAuthenticated } from './selectors/authentication';
import { SOURCE_LIST_REQUEST, ANALYSIS_LABEL_LIST_REQUEST } from './constants/ActionTypes';

import App from './screens/App';
import Login from './screens/Login';

class AuthGate extends Component {
  static propTypes = {
    initApp: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
  }

  componentDidMount () {
    if (this.props.isAuthenticated) {
      this.props.initApp();
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.isAuthenticated && nextProps.isAuthenticated) {
      nextProps.initApp();
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
    },
  };
};

export default hot(connect(mapStateToProps, mapDispatchToProps)(AuthGate));
