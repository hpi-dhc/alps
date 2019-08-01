import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormGroup,
  FormLabel,
  makeStyles,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  OutlinedInput,
  FormHelperText,
} from '@material-ui/core';
import {
  MuiPickersUtilsProvider,
  DatePicker,
  TimePicker,
} from '@material-ui/pickers';
import CloseIcon from '@material-ui/icons/Close';
import DateFnsUtils from '@date-io/date-fns';
import { isBefore } from 'date-fns';
import { getAnalysisLabels } from '../../selectors/data';

const useStyles = makeStyles(theme => ({
  input: {
    marginBottom: theme.spacing(2),
  },
  dateInput: {
    marginRight: theme.spacing(1),
  },
  newLabelContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deleteButton: {
    position: 'absolute',
    left: theme.spacing(2),
  },
}));

AnalysisSampleDialog.propTypes = {
  label: PropTypes.string,
  scope: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  open: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
};

AnalysisSampleDialog.defaultProps = {
  label: '',
  scope: [new Date(), new Date()],
  open: false,
};

function AnalysisSampleDialog ({ label: labelProp, scope, open, onCancel: handleCancel, onConfirm, onDelete: handleDelete }) {
  const [startDate, setStartDate] = useState(scope[0]);
  const [endDate, setEndDate] = useState(scope[1]);
  const [label, setLabel] = useState(labelProp);
  const [isNewLabel, setIsNewLabel] = useState(false);
  const [hasLabelError, setHasLabelError] = useState(false);
  const labels = useSelector(getAnalysisLabels);
  const classes = useStyles();

  useEffect(() => {
    setStartDate(scope[0]);
    setEndDate(scope[1]);
  }, [scope]);

  useEffect(() => {
    setLabel(labelProp);
  }, [labelProp]);

  // clear data on close
  useEffect(() => {
    if (!open) {
      setLabel('');
      setIsNewLabel(false);
      setHasLabelError(false);
    }
  }, [open]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (!isBefore(startDate, endDate)) {
      return;
    }
    if (!label) {
      setHasLabelError(true);
      return;
    }
    if (onConfirm) {
      onConfirm({
        label,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      }, isNewLabel);
    }
  }, [startDate, endDate, label, onConfirm, isNewLabel]);

  const handleCloseNewLabel = () => {
    setLabel('');
    setIsNewLabel(false);
  };

  const handleLabelChange = (event) => {
    let { value } = event.target;
    if (!isNewLabel && value === 'new-label') {
      setLabel('');
      setIsNewLabel(true);
    } else {
      setLabel(value);
    }
    setHasLabelError(false);
  };

  const handleLabelBlur = () => {
    setLabel(value => value.trim());
  };

  return (
    <Dialog open={open} fullWidth>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <DialogTitle>{labelProp ? 'Edit' : 'Create'} sample for analysis</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent root={{ display: 'flex', flexWrap: 'wrap' }}>
            { !isNewLabel &&
              <FormControl
                fullWidth
                variant='outlined'
                className={classes.input}
                required
                error={hasLabelError}
              >
                <InputLabel>Sample Label</InputLabel>
                <Select
                  value={label}
                  input={<OutlinedInput name='label-select' id='label-select' />}
                  onChange={handleLabelChange}
                  required
                >
                  <MenuItem value={'new-label'}>Add new label</MenuItem>
                  { Object.values(labels).map(each => <MenuItem key={each.id} value={each.id}>{each.name}</MenuItem>) }
                </Select>
                <FormHelperText hidden={!hasLabelError}>Please select a label</FormHelperText>
              </FormControl>
            }
            { isNewLabel &&
              <div className={classes.newLabelContainer}>
                <TextField
                  autoFocus
                  fullWidth
                  id='label-input'
                  name='label-input'
                  variant='outlined'
                  value={label}
                  label='New sample label'
                  className={classes.input}
                  InputProps={{
                    onChange: handleLabelChange,
                    onBlur: handleLabelBlur,
                  }}
                  required
                />
                <IconButton onClick={handleCloseNewLabel}>
                  <CloseIcon />
                </IconButton>
              </div>
            }
            <FormGroup className={classes.input}>
              <FormLabel>From *</FormLabel>
              <div>
                <DatePicker
                  id='from-date'
                  value={startDate}
                  autoOk
                  variant='inline'
                  inputVariant='outlined'
                  className={classes.dateInput}
                  format='yyyy-MM-dd'
                  onChange={setStartDate}
                  required
                />
                <TimePicker
                  id='from-time'
                  value={startDate}
                  autoOk
                  variant='inline'
                  inputVariant='outlined'
                  ampm={false}
                  views={['hours', 'minutes', 'seconds']}
                  format='HH:mm:ss'
                  onChange={setStartDate}
                  required
                />
              </div>
            </FormGroup>
            <FormGroup className={classes.input}>
              <FormLabel>To *</FormLabel>
              <div>
                <DatePicker
                  id='to-date'
                  value={endDate}
                  autoOk
                  variant='inline'
                  inputVariant='outlined'
                  className={classes.dateInput}
                  format='yyyy-MM-dd'
                  onChange={setEndDate}
                  required
                />
                <TimePicker
                  id='to-time'
                  value={endDate}
                  autoOk
                  variant='inline'
                  inputVariant='outlined'
                  ampm={false}
                  views={['hours', 'minutes', 'seconds']}
                  format='HH:mm:ss'
                  onChange={setEndDate}
                  required
                />
              </div>
              <FormHelperText error hidden={isBefore(startDate, endDate)}>Start date must be before end date.</FormHelperText>
            </FormGroup>
          </DialogContent>
          <DialogActions>
            { handleDelete &&
              <Button onClick={handleDelete} className={classes.deleteButton}>Delete</Button>
            }
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type='submit' color='secondary'>Save</Button>
          </DialogActions>
        </form>
      </MuiPickersUtilsProvider>
    </Dialog>
  );
}

export default AnalysisSampleDialog;
