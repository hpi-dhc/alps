import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Select, MenuItem, Radio } from '@material-ui/core';
import * as Sync from '../../actions/sync';
import { getDatasets, getAllSignals } from '../../selectors/data';
import { getSelectedSignals, getReference } from '../../selectors/sync';

SignalSelect.propTypes = {
  dataset: PropTypes.string.isRequired,
};

export function SignalSelect (props) {
  const dataset = useSelector(getDatasets)[props.dataset];
  const signals = useSelector(getAllSignals);
  const selectedSignal = useSelector(getSelectedSignals)[props.dataset];
  const reference = useSelector(getReference);
  const isReference = Boolean(reference) && reference === props.dataset;

  const dispatch = useDispatch();
  const handleReferenceChange = useCallback((_, checked) => {
    dispatch(Sync.setSignal(dataset.id, selectedSignal, checked));
  }, [dataset.id, dispatch, selectedSignal]);

  const handleSignalChange = useCallback((event) => {
    dispatch(Sync.setSignal(dataset.id, event.target.value, isReference));
  }, [dataset.id, dispatch, isReference]);

  return (
    <div>
      <Radio
        checked={isReference}
        onChange={handleReferenceChange}
        disabled={!selectedSignal}
        title='Select as reference signal'
      />
      <Select
        value={selectedSignal}
        onChange={handleSignalChange}
        name={`signal-${dataset.id}`}
        displayEmpty
      >
        <MenuItem value={undefined}>None</MenuItem>
        {
          dataset.signals.map(
            id => <MenuItem key={id} value={id}>{signals[id].name}</MenuItem>
          )
        }
      </Select>
    </div>
  );
};
