import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider } from '@material-ui/styles';
import { CssBaseline, makeStyles, LinearProgress, Box } from '@material-ui/core';
import theme from '../theme';

import AppBar from '../components/Common/AppBar';
import SessionToolbar from '../components/Session/Toolbar';

import Sidebar from '../components/Common/Sidebar';

import SubjectList from './SubjectList';
import SubjectDetail from './SubjectDetail';
import SessionDetail from './SessionDetail';
import SessionPreprocess from './SessionPreprocess';
import PreprocessSidebar from '../components/Preprocess/Sidebar';
import BuildIcon from '@material-ui/icons/Build';

import { getIsLoading } from '../selectors/data';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  appBarSpacer: {
    ...theme.mixins.toolbar,
    height: theme.mixins.toolbar.minHeight * 2, // TODO: Make responsive
  },
  loadingBar: {
    zIndex: theme.zIndex.drawer + 3,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  loadingBarSecondary: {
    backgroundColor: 'transparent',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    overflow: 'auto',
  },
}));

export default () => {
  const classes = useStyles();
  const isLoading = useSelector(getIsLoading);

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <CssBaseline />
        <LinearProgress
          hidden={!isLoading}
          color='secondary'
          className={classes.loadingBar}
          classes={{
            colorSecondary: classes.loadingBarSecondary,
          }}
        />
        <AppBar>
          <Route path='/sessions/:sessionId' component={SessionToolbar} />
        </AppBar>
        <Box display='flex'>
          <main className={classes.content}>
            <Switch>
              <Route exact path={'/'} component={SubjectList} />
              <Route path='/subjects/:subjectId' component={SubjectDetail} />
              <Route exact path={'/sessions/:sessionId'} component={SessionDetail} />
              <Route path={'/sessions/:sessionId/sync'} component={BuildIcon} />
              <Route path={'/sessions/:sessionId/preprocess'} component={SessionPreprocess} />
              <Route path={'/sessions/:sessionId/analyse'} component={BuildIcon} />
              <Redirect to='/' />
            </Switch>
          </main>
          <Sidebar path='/sessions/:sessionId/preprocess' component={PreprocessSidebar} />
        </Box>
      </div>
    </ThemeProvider>
  );
};
