import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { getItems } from '../../selectors/plots';
import {
  Container,
  makeStyles,
  Divider,
  Typography,
  Button,
} from '@material-ui/core';
import AnalysisSampleList from '../AnalysisSample/List';
import PlotMode from '../Signal/PlotMode';
import TagSelect from '../Common/TagSelect';
import ProcessingMethodList from '../ProcessingMethod/List';
import * as Signal from '../../actions/signals';

const useStyles = makeStyles(theme => ({
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  runButton: {
    position: 'sticky',
    marginTop: theme.spacing(3),
    bottom: theme.spacing(2),
    width: `calc(100% - ${theme.spacing(4)}px)`,
    left: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

PreprocessSidebar.propTypes = {
  match: PropTypes.object.isRequired,
};

function PreprocessSidebar ({ match }) {
  const classes = useStyles();
  const { sessionId } = match.params;
  const plots = useSelector(getItems)[sessionId];
  const signal = plots ? plots.plots[plots.mainPlot].signal : undefined;
  const [filter, setFilter] = useState();
  const [configurations, setConfigurations] = useState({});
  const canApplyFilter = signal && filter;

  const dispatch = useDispatch();
  const handleApplyFilter = useCallback(() => {
    dispatch(Signal.filter(
      sessionId,
      signal,
      filter,
      configurations[filter],
    ));
  }, [configurations, dispatch, filter, sessionId, signal]);

  const handleConfigChange = (method, key, value) => {
    setConfigurations(prev => {
      if (!prev.hasOwnProperty(method)) {
        prev[method] = {};
      }
      prev[method][key] = value;
      return { ...prev };
    });
  };

  const handleFilterSelect = (method, selected) => {
    setFilter(selected ? method : undefined);
  };

  if (!plots) {
    return <div />;
  }

  return (
    <React.Fragment>
      <Container>
        <PlotMode session={sessionId} />
        <Divider className={classes.divider} />
        <TagSelect session={sessionId} />
        <Divider className={classes.divider} />
        <Typography variant='caption' color='textSecondary' gutterBottom>Analysis Samples</Typography>
        <AnalysisSampleList session={sessionId} />
        <Divider className={classes.divider} />
        <Typography variant='caption' color='textSecondary' gutterBottom>Filter Methods</Typography>
        <ProcessingMethodList
          types={['FI']}
          selected={[filter]}
          configurations={configurations}
          onChange={handleConfigChange}
          onSelect={handleFilterSelect}
        />
      </Container>
      <Button
        onClick={handleApplyFilter}
        disabled={!canApplyFilter}
        className={classes.runButton}
        size='small'
        variant='contained'
        color='secondary'
      >
        Apply Filter
      </Button>
    </React.Fragment>
  );
};

export default PreprocessSidebar;
