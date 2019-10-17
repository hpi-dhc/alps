import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, FormControl, InputLabel, Input, Box, InputAdornment } from '@material-ui/core';
import generateColor from '@eknowles/color-this';

import { getParams } from '../../selectors/sync';
import { getSources, getDatasets } from '../../selectors/data';
import * as Sync from '../../actions/sync';
import { SignalSelect } from './SignalSelect';

export function SynchronizationParameters ({ datasets }) {
  const dispatch = useDispatch();
  const allDatasets = useSelector(getDatasets);
  const params = useSelector(getParams);
  const sources = useSelector(getSources);

  const handleParametersChange = useCallback((event) => {
    const [id, param] = event.target.id.split('#');
    if (!params[id] || params[id][param] !== event.target.value) {
      dispatch(Sync.setParams(id, { [param]: event.target.value }));
    }
  }, [dispatch, params]);

  const getSourceName = useCallback((dataset) => {
    const source = sources[allDatasets[dataset].source];
    return source ? source.name : 'Raw files';
  }, [allDatasets, sources]);

  const renderDatasetColor = (dataset) => {
    return <div style={{ display: 'inline-block', backgroundColor: generateColor(dataset), width: 16, height: 16, marginInlineEnd: 8 }} />;
  };

  const renderInput = (dataset) => {
    const datasetParams = params[dataset] || {};

    return (
      <Box key={dataset} marginBottom={2}>
        <Box display='flex' alignItems='center'>
          {renderDatasetColor(dataset)}
          <Typography variant='body2'>
            {allDatasets[dataset].title} ({getSourceName(dataset)})
          </Typography>
        </Box>
        <SignalSelect dataset={dataset} />
        <Box display='flex' flexDirection='column' paddingLeft={1}>
          <FormControl>
            <InputLabel>Stretch Factor</InputLabel>
            <Input
              id={dataset + '#stretchFactor'}
              type='number'
              value={datasetParams.stretchFactor}
              onChange={handleParametersChange}
            />
          </FormControl>
          <FormControl>
            <InputLabel>Timeshift</InputLabel>
            <Input
              id={dataset + '#timeshift'}
              type='number'
              value={datasetParams.timeshift}
              onChange={handleParametersChange}
              endAdornment={<InputAdornment position='end'>s</InputAdornment>}
            />
          </FormControl>
        </Box>
      </Box>
    );
  };

  return (
    <div>
      <Typography variant='h6' gutterBottom>Parameters</Typography>
      {datasets.map(renderInput)}
    </div>
  );
}
