import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { FormControl, Typography } from '@material-ui/core';
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab';
import PanIcon from '@material-ui/icons/PanTool';
import ZoomIcon from '@material-ui/icons/ZoomIn';
import LabelIcon from '@material-ui/icons/Label';
import * as plotModes from '../../constants/PlotModes';
import { setMode } from '../../actions/plots';
import { getMode } from '../../selectors/plots';

PlotMode.propTypes = {
  hideZoom: PropTypes.bool,
  hidePan: PropTypes.bool,
  hideLabel: PropTypes.bool,
};

PlotMode.defaultProps = {
  hideZoom: false,
  hidePan: false,
  hideLabel: false,
};

export default function PlotMode ({ hideZoom, hidePan, hideLabel, ...props }) {
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
        { !hideZoom &&
          <ToggleButton
            value={plotModes.ZOOM_MODE}
            title='Zoom'
          >
            <ZoomIcon fontSize='small' />
          </ToggleButton>
        }
        { !hidePan &&
          <ToggleButton
            value={plotModes.PAN_MODE}
            title='Pan'
          >
            <PanIcon fontSize='small' />
          </ToggleButton>
        }
        { !hideLabel &&
          <ToggleButton
            value={plotModes.LABEL_MODE}
            title='Add analysis sample'
          >
            <LabelIcon fontSize='small' />
          </ToggleButton>
        }
      </ToggleButtonGroup>
    </FormControl>
  );
}
