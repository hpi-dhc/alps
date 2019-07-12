import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import moment from 'moment';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  makeStyles,
  Typography,
  Grid,
} from '@material-ui/core';
import { getSignals, getRawFiles } from '../../selectors/data';

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
  },
  item: {
    flexGrow: 1,
  },
}));

DetailPanel.propTypes = {
  dataset: PropTypes.object.isRequired,
};

DetailPanel.defaultProps = {
  dataset: { signals: [], rawFiles: [] },
};

function DetailPanel ({ dataset }) {
  const classes = useStyles();
  const signals = useSelector(getSignals);
  const rawFiles = useSelector(getRawFiles);

  return (
    <Grid
      container
      className={classes.container}
      spacing={2}
    >
      <Grid item className={classes.item}>
        <Typography variant='body2'>Signals</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align='right'>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataset.signals.map(each => (
              <TableRow key={each}>
                <TableCell component='th' scope='row'>
                  {signals[each].name}
                </TableCell>
                <TableCell align='right'>
                  {signals[each].type}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
      <Grid item className={classes.item}>
        <Typography variant='body2'>Files</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align='right'>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataset.rawFiles.map(each => (
              <TableRow key={each}>
                <TableCell component='th' scope='row'>
                  {rawFiles[each].name}
                </TableCell>
                <TableCell align='right'>
                  {rawFiles[each].timestamp &&
                    moment(rawFiles[each].timestamp).format('LLL')
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
}

export default DetailPanel;
