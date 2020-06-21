import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import {
  withStyles,
  AppBar as AppBarMUI,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  IconButton,
} from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/Settings';

import Breadcrumb from './Breadcrumb';
import { requestLogout } from '../../actions/authentication';
import AlpsIcon from './AlpsIcon';

class AppBar extends React.PureComponent {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    handleLogout: PropTypes.func.isRequired,
    children: PropTypes.node,
  }

  state = {
    anchorEl: null,
  }

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: null });
  }

  render () {
    const { anchorEl } = this.state;
    const { children, classes, handleLogout } = this.props;

    return (
      <AppBarMUI position='sticky' className={classes.appBar}>
        <Toolbar>
          <Link className={classes.titleLink} to='/'>
            <AlpsIcon className={classes.icon} />
            <Typography
              className={classes.title}
              component='h1'
              variant='h6'
              noWrap
            >
              ALPS
            </Typography>
          </Link>
          <Breadcrumb />
          <IconButton disabled color='inherit' onClick={this.handleClick}>
            <SettingsIcon />
          </IconButton>
          <IconButton color='inherit' onClick={this.handleClick}>
            <AccountCircleIcon />
          </IconButton>
          <Menu
            id='account-menu'
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={this.handleClose}
          >
            <MenuItem disabled>My account</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
        {children}
      </AppBarMUI>
    );
  }
}

const styles = theme => ({
  icon: {
    fontSize: 48,
    opacity: 0.54,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  title: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
  },
  titleLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: theme.palette.primary.contrastText,
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
});

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleLogout: () => dispatch(requestLogout()),
  };
};

const AppBarStyled = withStyles(styles)(AppBar);
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppBarStyled));
