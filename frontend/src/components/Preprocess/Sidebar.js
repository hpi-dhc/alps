import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getItems } from '../../selectors/preprocess';
import {
  Container,
  makeStyles,
  Divider,
  Typography,
} from '@material-ui/core';
import AnalysisSampleList from '../AnalysisSample/List';
import PlotMode from './PlotMode';
import TagSelect from './TagSelect';

const useStyles = makeStyles(theme => ({
  selectWithIcon: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

PreprocessSidebar.propTypes = {
  match: PropTypes.object.isRequired,
};

function PreprocessSidebar ({ match }) {
  const { sessionId } = match.params;
  const preprocess = useSelector(getItems)[sessionId];
  const classes = useStyles();

  if (!preprocess) {
    return <div />;
  }

  return (
    <Container>
      <PlotMode session={sessionId} />
      <Divider className={classes.divider} />
      <TagSelect session={sessionId} />
      <Divider className={classes.divider} />
      <Typography variant='caption' color='textSecondary' gutterBottom>Analysis Samples</Typography>
      <AnalysisSampleList session={sessionId} />
      <Divider className={classes.divider} />
      <Typography variant='caption' color='textSecondary' gutterBottom>Filter methods</Typography>
    </Container>
  );
};

export default PreprocessSidebar;
