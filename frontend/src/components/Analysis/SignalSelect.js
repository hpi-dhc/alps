import React, { useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import {
  getDatasets,
  getDatasetsArrayBySession,
  getIBISignals,
} from '../../selectors/data';
import {
  FormControl,
  FormGroup,
  FormLabel,
  FormControlLabel,
  Checkbox,
  Typography,
  makeStyles,
} from '@material-ui/core';
import * as Analysis from '../../actions/analysis';
import { getSelectedSignals } from '../../selectors/analysis';

const useStyles = makeStyles(theme => ({
  controlLabel: {
    whiteSpace: 'nowrap',
    textOrientation: 'ellipsis',
  },
}));

SignalSelect.propTypes = {
  session: PropTypes.string,
  inputLabel: PropTypes.string,
};

SignalSelect.defaultProps = {
  inputLabel: 'Signals',
};

export default function SignalSelect ({ session: sessionId, inputLabel }) {
  const classes = useStyles();
  const selectedSignals = useSelector(getSelectedSignals);
  const datasets = useSelector(getDatasets);
  const datasetsOfSession = useSelector(getDatasetsArrayBySession)[sessionId];
  const signals = useSelector(getIBISignals);
  const selectableSignals = useMemo(() => {
    if (!datasetsOfSession) return [];
    const signalIds = datasetsOfSession.reduce((array, each) => [...array, ...each.signals], []);
    return signalIds.map(each => signals[each]).filter(each => typeof each !== 'undefined');
  }, [signals, datasetsOfSession]);

  const disabled = !selectableSignals || !selectableSignals.length;

  const dispatch = useDispatch();
  const handleChange = useCallback((event) => {
    if (event.target.checked) {
      dispatch(Analysis.addSignal(event.target.value));
    } else {
      dispatch(Analysis.removeSignal(event.target.value));
    }
  }, [dispatch]);

  // Remove previously selected signals from store
  useEffect(() => {
    const selectableIds = selectableSignals.map(each => each.id);
    selectedSignals.forEach(signal => {
      if (!selectableIds.includes(signal)) {
        dispatch(Analysis.removeSignal(signal));
      }
    });
  }, [dispatch, selectedSignals, selectableSignals]);

  const isChecked = (id) => selectedSignals.includes(id);

  return (
    <FormControl component='fieldset' disabled={disabled}>
      <FormLabel component='legend'>
        <Typography variant='caption' color='textSecondary'>{inputLabel}</Typography>
      </FormLabel>
      <FormGroup>
        { selectableSignals.map(each =>
          <FormControlLabel
            key={each.id}
            className={classes.controlLabel}
            label={`${each.name} (${datasets[each.dataset].title})`}
            control={<Checkbox checked={isChecked(each.id)} onChange={handleChange} value={each.id} />}
          />
        )}
      </FormGroup>
    </FormControl>
  );
};
