import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import DefaultLayout from '../layouts/DefaultLayout';
import SessionLayout from '../layouts/SessionLayout';
import SubjectList from './SubjectList';
import SubjectDetail from './SubjectDetail';
import SessionDetail from './Session/Detail';
import SessionPreprocess from './Session/Preprocess';
import BuildIcon from '@material-ui/icons/Build';
import { ThemeProvider } from '@material-ui/styles';
import theme from '../theme';

export default () => {
  return (
    <ThemeProvider theme={theme}>
      <Switch>
        <DefaultLayout exact path={'/'} component={SubjectList} />
        <DefaultLayout path='/subjects/:subjectId' component={SubjectDetail} />
        <SessionLayout exact path='/sessions/:sessionId' component={SessionDetail} />
        <SessionLayout path='/sessions/:sessionId/sync' component={BuildIcon} />
        <SessionLayout path='/sessions/:sessionId/preprocess' component={SessionPreprocess} />
        <SessionLayout path='/sessions/:sessionId/analyse' component={BuildIcon} />
        <Redirect to='/' />
      </Switch>
    </ThemeProvider>
  );
};
