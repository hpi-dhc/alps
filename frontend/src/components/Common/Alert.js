import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@material-ui/core';

function Alert ({ title, message, onCancel, onConfirm, confirmText, ...props }) {
  return (
    <Dialog {...props}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm}>{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
};

Alert.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};

Alert.defaultProps = {
  confirmText: 'Confirm',
};

export default Alert;
