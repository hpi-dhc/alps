import React from 'react';
import { CircularProgress, Typography, Box } from '@material-ui/core';

function Loading () {
  return (
    <Box
      style={{ height: '100%' }}
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
    >
      <CircularProgress color='secondary' />
      <Typography style={{ marginTop: 16 }}>Loading data.</Typography>
    </Box>
  );
};

export default Loading;
