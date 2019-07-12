import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoginForm from '../components/Login/Form';
import { requestLogin } from '../actions/authentication';
import { getErrorMessage } from '../selectors/authentication';

function LoginScreen (props) {
  return (
    <LoginForm {...props} />
  );
}

LoginScreen.propTypes = {
  handleSignIn: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
};

const mapStateToProps = (state) => {
  return {
    errorMessage: getErrorMessage(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleSignIn: (username, password) => dispatch(requestLogin(username, password)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
