import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { getItems } from '../../selectors/plots';
import {
  Container,
  makeStyles,
  Divider,
  Typography,
  Box,
  Button,
} from '@material-ui/core';
import PlotMode from '../Signal/PlotMode';
import ProcessingMethodList from '../ProcessingMethod/List';
import LabelSelect from './LabelSelect';
import { ANALYSIS_RUN } from '../../constants/ActionTypes';
import { canRunAnalysis } from '../../selectors/analysis';
import SignalSelect from './SignalSelect';

const useStyles = makeStyles(theme => ({
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  runButton: {
    position: 'absolute',
    bottom: theme.spacing(2),
    width: `calc(100% - ${theme.spacing(4)}px)`,
    left: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

AnalysisSidebar.propTypes = {
  match: PropTypes.object.isRequired,
};

function AnalysisSidebar ({ match }) {
  const classes = useStyles();
  const sessionId = match.params.sessionId;
  const plots = useSelector(getItems)[sessionId];
  const runDisabled = !useSelector(canRunAnalysis);

  const dispatch = useDispatch();
  const handleRunAnalysis = useCallback(() => {
    const signal = plots.plots[plots.mainPlot].signal;
    dispatch({ type: ANALYSIS_RUN, signal });
  }, [dispatch, plots]);

  if (!plots) {
    return <div />;
  }

  return (
    <React.Fragment>
      <Container>
        <PlotMode />
        <Divider className={classes.divider} />
        <LabelSelect session={sessionId} inputLabel='Label' />
        <Divider className={classes.divider} />
        <SignalSelect session={sessionId} />
        <Divider className={classes.divider} />
        <Typography variant='caption' color='textSecondary' gutterBottom>Methods</Typography>
        <ProcessingMethodList />
      </Container>
      <Button
        className={classes.runButton}
        size='small'
        variant='contained'
        color='secondary'
        onClick={handleRunAnalysis}
        disabled={runDisabled}
      >
        Run Analysis
      </Button>
    </React.Fragment>
  );
};

export default AnalysisSidebar;
