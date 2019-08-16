import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormControl, Typography } from '@material-ui/core';
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab';
import PanIcon from '@material-ui/icons/PanTool';
import ZoomIcon from '@material-ui/icons/ZoomIn';
import LabelIcon from '@material-ui/icons/Label';
import * as plotModes from '../../constants/PlotModes';
import { setMode } from '../../actions/plots';
import { getMode } from '../../selectors/plots';

export default function PlotMode (props) {
  const dispatch = useDispatch();
  const mode = useSelector(getMode);

  const handleChange = useCallback((event, mode) => {
    dispatch(setMode(mode));
  }, [dispatch]);

  return (
    <FormControl {...props}>
      <Typography variant='caption' color='textSecondary' gutterBottom>
        Selection mode
      </Typography>
      <ToggleButtonGroup
        value={mode}
        onChange={handleChange}
        exclusive
        size='small'
      >
        <ToggleButton value={plotModes.ZOOM_MODE} title='Zoom'><ZoomIcon fontSize='small' /></ToggleButton>
        <ToggleButton value={plotModes.PAN_MODE} title='Pan'><PanIcon fontSize='small' /></ToggleButton>
        <ToggleButton value={plotModes.LABEL_MODE} title='Add analysis sample'><LabelIcon fontSize='small' /></ToggleButton>
      </ToggleButtonGroup>
    </FormControl>
  );
}
