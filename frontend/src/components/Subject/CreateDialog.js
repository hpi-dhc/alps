import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@material-ui/core';
import { create } from '../../actions/subjects';

SubjectCreateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
};

function SubjectCreateDialog ({ open, onCancel }) {
  const [identifier, setIdentifier] = useState('');
  const dispatch = useDispatch();

  const handleCancel = onCancel;

  const handleSave = useCallback((event) => {
    event.preventDefault();
    dispatch(create(identifier));
    onCancel();
  }, [dispatch, identifier, onCancel]);

  const handleInputChange = (event) => {
    setIdentifier(event.currentTarget.value);
  };

  return (
    <Dialog open={open} fullWidth>
      <DialogTitle>Create Subject</DialogTitle>
      <form onSubmit={handleSave}>
        <DialogContent root={{ display: 'flex', flexWrap: 'wrap' }}>
          <TextField
            autoFocus
            label='Identifier'
            variant='outlined'
            id='identifier'
            onChange={handleInputChange}
            fullWidth
            required
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

export default SubjectCreateDialog;
