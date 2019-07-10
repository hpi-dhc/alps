import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import moment from 'moment';

import DatasetTable from '../../components/Dataset/Table';
import DatasetCreateDialog from '../../components/Dataset/CreateDialog';
import { Typography, Container } from '@material-ui/core';

import { useSession } from '../../api/sessions';
import { useAppBarTitle } from '../../components/Common/AppBar';
import Loading from '../../components/Common/Loading';
import { createDataset, uploadFiles, deleteDataset } from '../../api/datasets';
import Alert from '../../components/Common/Alert';

function SessionDetail ({ match }) {
  const { sessionId } = match.params;
  const [ isDialogOpen, setDialogOpen ] = useState(false);
  const [ isAlertOpen, setAlertOpen ] = useState(false);
  const [ datasetsToDelete, setDatasetsToDelete ] = useState([]);
  const { data: session, isLoading, reload } = useSession(sessionId);
  useAppBarTitle(session.title);

  const handleSaveDataset = useCallback(
    async (data) => {
      const { session, files, ...payload } = data;
      try {
        const response = await createDataset(sessionId, payload);
        await uploadFiles(response.data.id, files);
        reload();
        setDialogOpen(false);
      } catch (error) {
        console.log('Failed creating dataset.');
      }
    },
    [sessionId, reload]
  );

  const handleDeleteDatasets = useCallback(
    async () => {
      for (let each of datasetsToDelete) {
        try {
          await deleteDataset(each.id);
        } catch (error) {
          console.log('Failed deleting dataset: ', each.id);
        }
      }
      closeAlert();
      reload();
    },
    [reload, datasetsToDelete]
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

  if (isLoading) {
    return (
      <Container>
        <Loading />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant='h5'>{session.title || 'Loading...'}</Typography>
      <Typography variant='subtitle1' gutterBottom>
        {session.date ? moment(session.date).format('LL') : '-'}
      </Typography>
      <DatasetTable
        datasets={session.datasets}
        isLoading={isLoading}
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
