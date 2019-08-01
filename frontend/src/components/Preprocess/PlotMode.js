import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { FormControl, Typography } from '@material-ui/core';
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab';
import PanIcon from '@material-ui/icons/PanTool';
import ZoomIcon from '@material-ui/icons/ZoomIn';
import LabelIcon from '@material-ui/icons/Label';
import * as plotModes from '../../constants/PlotModes';
import { setPlotMode } from '../../actions/preprocess';
import { getItems } from '../../selectors/preprocess';

PlotMode.propTypes = {
  session: PropTypes.string.isRequired,
};

export default function PlotMode ({ session, ...props }) {
  const dispatch = useDispatch();
  const preprocess = useSelector(getItems)[session];

  const handlePlotMode = useCallback((event, newPlotMode) => {
    dispatch(setPlotMode(session, newPlotMode));
  }, [dispatch, session]);

  return (
    <FormControl {...props}>
      <Typography variant='caption' color='textSecondary' gutterBottom>
        Selection mode
      </Typography>
      <ToggleButtonGroup
        value={preprocess.plotMode}
        onChange={handlePlotMode}
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
