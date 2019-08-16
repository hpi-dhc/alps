import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { getAnalysisSamplesArrayBySession, getAnalysisLabels } from '../../selectors/data';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import * as AnalysisLabels from '../../actions/analysisLabels';
import { getSelectedLabel } from '../../selectors/analysis';

LabelSelect.propTypes = {
  session: PropTypes.string,
  inputLabel: PropTypes.string,
};

LabelSelect.defaultProps = {
  inputLabel: 'Analysis Label',
};

export default function LabelSelect ({ session, inputLabel }) {
  const selectedLabel = useSelector(getSelectedLabel);
  const samples = useSelector(getAnalysisSamplesArrayBySession);
  const labels = useSelector(getAnalysisLabels);

  const selectableLabels = useMemo(() => {
    let selectable = Object.values(labels);
    if (session) {
      const sessionSamples = samples[session];
      const sessionLabels = Object.values(sessionSamples).map(each => each.label);
      selectable = selectable.filter(each => sessionLabels.includes(each.id));
    }
    return selectable;
  }, [session, samples, labels]);

  const disabled = !selectableLabels || !selectableLabels.length;

  const dispatch = useDispatch();
  const handleChange = useCallback((event) => {
    dispatch(AnalysisLabels.select(event.target.value));
  }, [dispatch]);

  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel>{inputLabel}</InputLabel>
      <Select
        value={selectedLabel || 'not-selected'}
        onChange={handleChange}
        name={`tags`}
      >
        { disabled &&
          <MenuItem value='not-selected' disabled>No labels available</MenuItem>
        }
        { !disabled &&
          <MenuItem value='not-selected' disabled>Select label</MenuItem>
        }
        { selectableLabels &&
          selectableLabels.map(
            each => <MenuItem key={each.id} value={each.id}>{each.name}</MenuItem>
          )
        }
      </Select>
    </FormControl>
  );
};
