import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { CircularProgress } from '@material-ui/core';
import ClockIcon from '@material-ui/icons/Schedule';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import { useDataset } from '../../api/datasets';

export const PROCESS_STATUS = {
  QUEUED: 'UP',
  PROCESSING: 'PR',
  PROCESSED: 'PD',
  ERROR: 'ER',
};

const StatusIcon = ({ status, ...props }) => {
  if (status === PROCESS_STATUS.QUEUED) {
    return <ClockIcon {...props} />;
  }
  if (status === PROCESS_STATUS.ERROR) {
    return <ErrorIcon color='error' {...props} />;
  }
  if (status === PROCESS_STATUS.PROCESSED) {
    return <CheckCircleIcon {...props} />;
  }
  if (status === PROCESS_STATUS.PROCESSING) {
    return <CircularProgress
      color='secondary'
      size={24}
      thickness={7.2}
      disableShrink {...props}
    />;
  }
};

export default StatusIcon;

export const AutoReloadStatusIcon = ({ id, ...props }) => {
  const { data: dataset, reload } = useDataset(id);

  useEffect(() => {
    let interval = null;
    if (
      dataset.status === PROCESS_STATUS.QUEUED ||
      dataset.status === PROCESS_STATUS.PROCESSING
    ) {
      interval = setInterval(() => {
        reload();
      }, 5000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [dataset, reload]);

  if (dataset.status) {
    return <StatusIcon status={dataset.status} {...props} />;
  } else {
    return <div />;
  }
};

AutoReloadStatusIcon.propTypes = {
  id: PropTypes.string.isRequired,
};
