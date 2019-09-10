import React, { useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { FormControl, InputLabel, Select, MenuItem, IconButton, makeStyles } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import { getSelectedSnapshot } from '../../selectors/analysis';
import { getAnalysisSnapshots } from '../../selectors/data';
import * as AnalysisSnapshots from '../../actions/analysisSnapshots';
import { ANALYSIS_SNAPSHOT_LIST_REQUEST } from '../../constants/ActionTypes';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    alignItems: 'flex-end',
  },
}));

const NONE_SELECTED = 'NONE_SELECTED';

SnapshotSelect.propTypes = {
  session: PropTypes.string.isRequired,
};

export default function SnapshotSelect ({ session }) {
  const classes = useStyles();
  const dispatch = useDispatch();

  const selectedSnapshot = useSelector(getSelectedSnapshot);
  const snapshots = useSelector(getAnalysisSnapshots);

  useEffect(() => {
    dispatch({ type: ANALYSIS_SNAPSHOT_LIST_REQUEST, session });
  }, [dispatch, session]);

  const handleChange = useCallback((event) => {
    const selected = event.target.value === NONE_SELECTED ? null : event.target.value;
    dispatch(AnalysisSnapshots.select(selected));
  }, [dispatch]);

  const handleSave = useCallback((event) => {

  }, []);

  const handleDelete = useCallback((event) => {

  }, []);

  return (
    <div className={classes.container}>
      <FormControl fullWidth>
        <InputLabel>Snapshot</InputLabel>
        <Select
          value={selectedSnapshot || NONE_SELECTED}
          onChange={handleChange}
          name={`snapshots`}
        >
          <MenuItem key={NONE_SELECTED} value={NONE_SELECTED}>None</MenuItem>
          { snapshots && Object.values(snapshots).map(
            each => <MenuItem key={each.id} value={each.id}>{each.name}</MenuItem>
          )}
        </Select>
      </FormControl>
      { selectedSnapshot
        ? <IconButton
          onClick={handleDelete}
          title='Link results to snapshot'
        >
          <DeleteIcon />
        </IconButton>
        : <IconButton
          onClick={handleSave}
          title='Remove results from snapshot'
        >
          <SaveIcon fontSize='small' />
        </IconButton>
      }
    </div>
  );
}
