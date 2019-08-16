import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Typography,
  IconButton,
} from '@material-ui/core';
import { format, differenceInSeconds } from 'date-fns';
import ZoomIcon from '@material-ui/icons/ZoomIn';

import * as AnalysisSamples from '../../actions/analysisSamples';
import { getAnalysisSamplesArrayBySession, getAnalysisLabels } from '../../selectors/data';
import { setDomain } from '../../actions/plots';
import AnalysisSampleIcon from './Icon';
import AnalysisSampleDialog from './Dialog';

AnalysisSampleList.propTypes = {
  session: PropTypes.string.isRequired,
};

export default function AnalysisSampleList ({ session }) {
  const dispatch = useDispatch();
  const analysisSamples = useSelector(state => getAnalysisSamplesArrayBySession(state)[session]);
  const analysisLabels = useSelector(getAnalysisLabels);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);

  const handleZoomToSample = useCallback((item) => {
    dispatch(setDomain(session, [new Date(item.start).valueOf(), new Date(item.end).valueOf()]));
  }, [dispatch, session]);

  const handleUpdateSample = useCallback((data) => {
    dispatch(AnalysisSamples.update(selectedSample.id, { ...selectedSample, ...data }));
    setSelectedSample(null);
    setDialogOpen(false);
  }, [dispatch, selectedSample]);

  const handleEditSample = (item) => {
    setSelectedSample(item);
    setDialogOpen(true);
  };

  const handleCancelDialog = () => {
    setDialogOpen(false);
    setSelectedSample(null);
  };

  const handleDeleteSample = useCallback(() => {
    dispatch(AnalysisSamples.destroy(selectedSample.id));
    setSelectedSample(null);
    setDialogOpen(false);
  }, [dispatch, selectedSample]);

  const getItemLength = (item) => {
    const start = new Date(item.start);
    const end = new Date(item.end);
    let seconds = differenceInSeconds(end, start);
    let minutes = Math.floor(seconds / 60);
    seconds = seconds - (minutes * 60);
    return { seconds, minutes };
  };

  const getItemTitle = (item) => {
    const start = new Date(item.start);
    const startString = format(start, 'PPpp');
    return `Starts at ${startString}`;
  };

  const renderItem = (item) => {
    const { minutes, seconds } = getItemLength(item);
    const length = `${minutes} min. ${seconds} sec.`;
    return (
      <ListItem
        button
        disableGutters
        key={item.id}
        title={getItemTitle(item)}
        onClick={() => handleEditSample(item)}
      >
        <ListItemIcon>
          <AnalysisSampleIcon sample={item} />
        </ListItemIcon>
        <ListItemText secondary={length}>{analysisLabels[item.label].name}</ListItemText>
        <ListItemSecondaryAction>
          <IconButton onClick={() => handleZoomToSample(item)}>
            <ZoomIcon fontSize='small' />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  if (!analysisSamples || !analysisSamples.length) {
    return (
      <Typography variant='body1' color='textSecondary'>No samples to display</Typography>
    );
  }

  return (
    <React.Fragment>
      <List dense disablePadding>
        {analysisSamples.map(renderItem)}
      </List>
      <AnalysisSampleDialog
        open={isDialogOpen}
        label={selectedSample ? selectedSample.label : undefined}
        scope={selectedSample ? [new Date(selectedSample.start), new Date(selectedSample.end)] : undefined}
        onConfirm={handleUpdateSample}
        onCancel={handleCancelDialog}
        onDelete={handleDeleteSample}
      />
    </React.Fragment>
  );
}
