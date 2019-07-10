import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import { Divider } from '@material-ui/core';
import AppBarMUI from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import HeartIcon from '@material-ui/icons/Timeline';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import { requestLogout } from '../../actions/authentication';
import { setAppTitle } from '../../actions/app';
import { getAppTitle } from '../../selectors/app';

export function useAppBarTitle (title) {
  const dispatch = useDispatch();
  const setTitle = useCallback(
    (title) => dispatch(setAppTitle(title)),
    [dispatch]
  );

  useEffect(() => {
    setTitle(title);
  }, [setTitle, title]);
}

class AppBar extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    handleLogout: PropTypes.func.isRequired,
    title: PropTypes.string,
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
    const { children, classes, handleLogout, history, title } = this.props;

    return (
      <AppBarMUI position='absolute'>
        <Toolbar>
          <Link className={classes.titleLink} to='/'>
            <HeartIcon className={classes.icon} />
            <Typography
              className={classes.title}
              component='h1'
              variant='h6'
              noWrap
            >
              HRV
            </Typography>
          </Link>
          { !!title &&
            <IconButton color='inherit' onClick={history.goBack}>
              <ArrowBackIcon />
            </IconButton>
          }
          <Typography className={classes.breadcrumbs} noWrap>{title}</Typography>
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
        {children && <Divider />}
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
  breadcrumbs: {
    flexGrow: 1,
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
  return {
    title: getAppTitle(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleLogout: () => dispatch(requestLogout()),
  };
};

const AppBarStyled = withStyles(styles)(AppBar);
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppBarStyled));
