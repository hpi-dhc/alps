import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import LoginForm from '../components/Login/Form'
import { requestLogin } from '../actions/authentication'
import { getErrorMessage } from '../selectors/authentication'

class LoginScreen extends Component {
  render () {
    return (
      <LoginForm {...this.props} />
    )
  }
}

LoginScreen.propTypes = {
  handleSignIn: PropTypes.func.isRequired,
  errorMessage: PropTypes.string
}

const mapStateToProps = (state) => {
  return {
    errorMessage: getErrorMessage(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleSignIn: (username, password) => dispatch(requestLogin(username, password))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen)
