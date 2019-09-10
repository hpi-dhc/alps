import React from 'react';
import { useSelector } from 'react-redux';
import { Typography, Box, makeStyles } from '@material-ui/core';
import AnalysisResultItem from './ResultItem';
import { getSelectedMethods, getSelectedResultsByMethod } from '../../selectors/analysis';

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(2),
  },
  item: {
    marginBottom: theme.spacing(2),
  },
}));

export default function AnalysisResultList () {
  const classes = useStyles();
  const results = useSelector(getSelectedResultsByMethod);
  const methods = useSelector(getSelectedMethods);

  if (!Object.values(results).length) {
    return (
      <Box display='flex' justifyContent='center' className={classes.container}>
        <Typography color='textSecondary'>No analysis results to display</Typography>
      </Box>
    );
  }

  return (
    <div className={classes.container}>
      {methods.map(each =>
        <AnalysisResultItem
          key={each}
          className={classes.item}
          results={results[each]}
          method={each}
        />
      )}
    </div>
  );
}
