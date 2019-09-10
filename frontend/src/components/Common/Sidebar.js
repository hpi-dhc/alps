import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import { Drawer, makeStyles } from '@material-ui/core';

const drawerWidth = 300;

const useStyles = makeStyles(theme => ({
  drawer: {
    flexShrink: 0,
    width: drawerWidth,
    overflowY: 'scroll',
  },
  appBarSpacer: {
    minHeight: theme.mixins.toolbar.minHeight * 2 + theme.spacing(3), // TODO: Make responsive
  },
  drawerPaper: {
    width: drawerWidth,
  },
}));

function Sidebar ({ component: Component, ...props }) {
  const classes = useStyles();

  return (
    <Route {...props} render={matchProps => (
      <Drawer
        className={classes.drawer}
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor='right'
        variant='permanent'
      >
        <div className={classes.appBarSpacer} />
        <Component {...matchProps} />
      </Drawer>
    )} />
  );
};

Sidebar.propTypes = {
  component: PropTypes.any,
};

export default Sidebar;
