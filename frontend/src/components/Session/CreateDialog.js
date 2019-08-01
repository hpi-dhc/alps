import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  makeStyles,
} from '@material-ui/core';
import { create } from '../../actions/sessions';

const useStyles = makeStyles(theme => ({
  input: {
    display: 'block',
    marginBottom: theme.spacing(2),
  },
}));

SessionCreateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  subject: PropTypes.string.isRequired,
};

function SessionCreateDialog ({ subject, open, onCancel }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [ title, setTitle ] = useState('');
  const [ date, setDate ] = useState(null);

  const handleCancel = onCancel;

  const handleSave = useCallback((event) => {
    event.preventDefault();
    dispatch(create({ subject, title, date }));
    onCancel();
  }, [date, dispatch, onCancel, subject, title]);

  const handleInputChange = (event) => {
    const { id, value } = event.currentTarget;
    if (id === 'title') {
      setTitle(value);
    } else if (id === 'date') {
      setDate(value);
    }
  };

  return (
    <Dialog open={open} fullWidth>
      <DialogTitle>Create Session</DialogTitle>
      <form onSubmit={handleSave}>
        <DialogContent>
          <TextField
            autoFocus
            label='Title'
            id='title'
            variant='outlined'
            onChange={handleInputChange}
            className={classes.input}
            required
            fullWidth
          />
          <TextField
            label='Date'
            id='date'
            variant='outlined'
            type='date'
            onChange={handleInputChange}
            className={classes.input}
            required
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type='submit' color='secondary'>Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default SessionCreateDialog;
