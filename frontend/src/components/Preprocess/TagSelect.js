import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { FormControl, InputLabel, Select, MenuItem, IconButton, makeStyles } from '@material-ui/core';
import ResetIcon from '@material-ui/icons/Close';
import { getItems } from '../../selectors/preprocess';
import { getTagSignalsArrayBySession } from '../../selectors/data';
import { setTags } from '../../actions/preprocess';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    alignItems: 'flex-end',
  },
}));

TagSelect.propTypes = {
  session: PropTypes.string.isRequired,
};

export default function TagSelect ({ session }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const preprocess = useSelector(getItems)[session];
  const tagSignals = useSelector(getTagSignalsArrayBySession)[session];

  const handleChangeTags = useCallback((event) => {
    dispatch(setTags(session, event.target.value));
  }, [dispatch, session]);

  const handleResetTags = () => {
    handleChangeTags({ target: { value: '' } });
  };

  return (
    <div className={classes.container}>
      <FormControl fullWidth disabled={!tagSignals || !tagSignals.length}>
        <InputLabel>Tags</InputLabel>
        <Select
          value={preprocess.tags || 'not-selected'}
          onChange={handleChangeTags}
          name={`tags`}
        >
          { (!tagSignals || !tagSignals.length) &&
            <MenuItem value='not-selected' disabled>No tags available</MenuItem>
          }
          { tagSignals && tagSignals.length &&
            <MenuItem value='not-selected' disabled>No tags selected</MenuItem>
          }
          { tagSignals && tagSignals.map(
            each => <MenuItem key={each.id} value={each.id}>{each.name}</MenuItem>
          )}
        </Select>
      </FormControl>
      <IconButton onClick={handleResetTags} disabled={!tagSignals || !tagSignals.length}>
        <ResetIcon />
      </IconButton>
    </div>
  );
}
