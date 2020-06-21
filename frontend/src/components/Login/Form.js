import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  CssBaseline,
  FormControl,
  Input,
  InputLabel,
  Paper,
  Typography,
  withStyles,
} from '@material-ui/core';
import AlpsIcon from '../Common/AlpsIcon'

class LoginForm extends Component {
  constructor (props) {
    super(props);
    this.state = {
      username: null,
      password: null,
    };
  }

  static propTypes = {
    classes: PropTypes.object.isRequired,
    handleSignIn: PropTypes.func.isRequired,
    errorMessage: PropTypes.string,
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { username, password } = this.state;
    this.props.handleSignIn(username, password);
  }

  getErrorMessage = () => {
    const { errorMessage } = this.props;
    if (!errorMessage) {
      return '';
    }
    if (errorMessage.hasOwnProperty('nonFieldErrors')) {
      return errorMessage.nonFieldErrors[0];
    }
    return 'Something went wrong.';
  }

  render () {
    const { classes } = this.props;

    return (
      <main className={classes.main}>
        <CssBaseline />
        <Paper className={classes.paper}>
          <AlpsIcon color="primary" style={{ fontSize: '64px' }} />
          <Typography component='h1' variant='h5'>
            ALPS
          </Typography>
          <Typography variant='body1' color='error'>{this.getErrorMessage()}</Typography>
          <form className={classes.form} onSubmit={this.handleSubmit}>
            <FormControl margin='normal' required fullWidth>
              <InputLabel>Username</InputLabel>
              <Input name='username' type='text' autoFocus onChange={this.handleInputChange} />
            </FormControl>
            <FormControl margin='normal' required fullWidth>
              <InputLabel>Password</InputLabel>
              <Input name='password' type='password' autoComplete='current-password' onChange={this.handleInputChange} />
            </FormControl>
            <Button
              type='submit'
              fullWidth
              variant='contained'
              color='primary'
              className={classes.submit}
            >
              Sign in
            </Button>
          </form>
        </Paper>
      </main>
    );
  }
}

const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    [theme.breakpoints.up(400 + theme.spacing(3) * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(3)}px`,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    marginTop: theme.spacing(3),
  },
});

export default withStyles(styles)(LoginForm);
