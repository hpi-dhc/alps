import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormControl, InputLabel, Input, InputAdornment, Box, Button, Typography } from '@material-ui/core';
import { getOptions, canGetParameters } from '../../selectors/sync';
import * as Sync from '../../actions/sync';

export default function SynchronizationOptions () {
  const dispatch = useDispatch();
  const isGetParametersDisabled = !useSelector(canGetParameters);
  const options = useSelector(getOptions);

  const handleParametersRequest = useCallback(() => {
    dispatch(Sync.requestParams());
  }, [dispatch]);

  const handleChange = useCallback((event) => {
    const { id, value } = event.nativeEvent.target;
    dispatch(Sync.setOptions({ [id]: value }));
  }, [dispatch]);

  return (
    <Box display='flex' flexDirection='column'>
      <Typography variant='h6' gutterBottom>Shake Detection</Typography>
      <FormControl required>
        <InputLabel>Peak Threshold</InputLabel>
        <Input
          id='threshold'
          name='threshold'
          type='number'
          value={options.threshold}
          onChange={handleChange}
          inputProps={{
            max: 1,
            min: -1,
          }}
        />
      </FormControl>
      <FormControl required>
        <InputLabel>Maximum Peak Distance</InputLabel>
        <Input
          id='distance'
          name='distance'
          type='number'
          value={options.distance}
          onChange={handleChange}
          inputProps={{
            min: 1,
          }}
          endAdornment={<InputAdornment position='end'>ms</InputAdornment>}
        />
      </FormControl>
      <FormControl required>
        <InputLabel>Minimum of Peaks in Sequence</InputLabel>
        <Input
          id='minLength'
          name='minLength'
          type='number'
          value={options.minLength}
          onChange={handleChange}
          inputProps={{
            min: 1,
          }}
        />
      </FormControl>
      <FormControl required>
        <InputLabel>Start/End Window</InputLabel>
        <Input
          id='window'
          name='window'
          type='number'
          value={options.window}
          onChange={handleChange}
          endAdornment={<InputAdornment position='end'>s</InputAdornment>}
          inputProps={{
            min: 0,
          }}
        />
      </FormControl>
      <FormControl required>
        <InputLabel>Time Buffer for Segment</InputLabel>
        <Input
          id='timeBuffer'
          name='timeBuffer'
          type='number'
          value={options.timeBuffer}
          onChange={handleChange}
          endAdornment={<InputAdornment position='end'>s</InputAdornment>}
          inputProps={{
            min: 0,
          }}
        />
      </FormControl>
      <Button
        onClick={handleParametersRequest}
        variant='contained'
        disabled={isGetParametersDisabled}
      >
        Compute parameters
      </Button>
    </Box>
  );
}
