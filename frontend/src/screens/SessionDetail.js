import React, { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import DatasetTable from '../components/Dataset/Table';
import DatasetCreateDialog from '../components/Dataset/CreateDialog';
import { Typography, Container } from '@material-ui/core';

import * as Datasets from '../actions/datasets';
import * as Sessions from '../actions/sessions';
import { getSessions, getDatasetsArrayBySession } from '../selectors/data';
import Alert from '../components/Common/Alert';

function SessionDetail ({ match }) {
  const dispatch = useDispatch();
  const [ isDialogOpen, setDialogOpen ] = useState(false);
  const [ isAlertOpen, setAlertOpen ] = useState(false);
  const [ datasetsToDelete, setDatasetsToDelete ] = useState([]);

  const { sessionId } = match.params;
  const session = useSelector(getSessions)[sessionId];
  const datasets = useSelector(getDatasetsArrayBySession)[sessionId];

  useEffect(() => {
    dispatch(Sessions.get(sessionId));
  }, [dispatch, sessionId]);

  const handleSaveDataset = useCallback(
    (data) => {
      dispatch(Datasets.create(data));
      setDialogOpen(false);
    },
    [dispatch]
  );

  const handleDeleteDatasets = useCallback(
    () => {
      datasetsToDelete.forEach(each => dispatch(Datasets.destroy(each.id)));
      closeAlert();
    },
    [datasetsToDelete, dispatch]
  );

  const openAlert = (data) => {
    setDatasetsToDelete(data);
    setAlertOpen(true);
  };

  const closeAlert = () => {
    setDatasetsToDelete([]);
    setAlertOpen(false);
  };

  const openDialog = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  if (!session) {
    return;
  }

  return (
    <Container>
      <Typography variant='h5'>{session.title}</Typography>
      <Typography variant='subtitle1' gutterBottom>
        {session.date ? moment(session.date).format('LL') : '-'}
      </Typography>
      <DatasetTable
        datasets={datasets}
        onAdd={openDialog}
        onDelete={openAlert}
      />
      <DatasetCreateDialog
        open={isDialogOpen}
        onSave={handleSaveDataset}
        onCancel={closeDialog}
        session={sessionId}
      />
      <Alert
        open={isAlertOpen}
        title='Delete datasets'
        message='Do you really want to delete the selected datasets? This cannot be undone.'
        confirmText='Delete'
        onConfirm={handleDeleteDatasets}
        onCancel={closeAlert}
      />
    </Container>
  );
}

SessionDetail.propTypes = {
  match: PropTypes.object,
};

export default React.memo(SessionDetail);
