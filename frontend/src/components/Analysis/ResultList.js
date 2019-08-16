import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getAnalysisResults } from '../../selectors/data';
import { Typography, Box, makeStyles } from '@material-ui/core';
import AnalysisResultItem from './ResultItem';
import { getSelectedSignals, getSelectedLabel, getSelectedMethods } from '../../selectors/analysis';

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
  const allResults = useSelector(getAnalysisResults);
  const signals = useSelector(getSelectedSignals);
  const label = useSelector(getSelectedLabel);
  const methods = useSelector(getSelectedMethods);
  const results = useMemo(() => {
    if (typeof allResults !== 'object') return {};
    return Object.values(allResults)
      .filter((each) => {
        return each.label === label &&
          signals.includes(each.signal) &&
          each.snapshot === null; // TODO: Enabel selection of snapshot
      })
      .reduce((byMethod, each) => {
        if (!byMethod[each.method]) {
          byMethod[each.method] = [];
        }
        return {
          ...byMethod,
          [each.method]: [...byMethod[each.method], each],
        };
      }, {});
  }, [allResults, label, signals]);

  if (!methods.length || !signals.length || !Object.values(results).length) {
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
