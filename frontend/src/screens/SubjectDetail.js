import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import SessionTable from '../components/Session/Table';
import SessionCreateDialog from '../components/Session/CreateDialog';
import { Container, Typography } from '@material-ui/core';
import { getSessionsArrayBySubject, getSubjects } from '../selectors/data';
import * as Subjects from '../actions/subjects';
import * as Sessions from '../actions/sessions';
import Alert from '../components/Common/Alert';

function SubjectDetail ({ match, history }) {
  const dispatch = useDispatch();
  const subjectId = match.params.subjectId;
  const [ isDialogOpen, setDialogOpen ] = useState(false);
  const [ isAlertOpen, setAlertOpen ] = useState(false);
  const [ sessionsToDelete, setSessionsToDelete ] = useState([]);

  const subject = useSelector(getSubjects)[subjectId];
  const sessions = useSelector(getSessionsArrayBySubject)[subjectId];

  useEffect(() => {
    dispatch(Subjects.get(subjectId));
  }, [dispatch, subjectId]);

  const handleSessionClick = (_, session) => {
    history.push(`/sessions/${session.id}`);
  };

  const handleDeleteSessions = useCallback(
    () => {
      sessionsToDelete.forEach(each => dispatch(Sessions.destroy(each.id)));
      closeAlert();
    },
    [sessionsToDelete, dispatch]
  );

  const handleNewSession = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const openAlert = (data) => {
    setSessionsToDelete(data);
    setAlertOpen(true);
  };

  const closeAlert = () => {
    setAlertOpen(false);
  };

  if (!subject) {
    return <div />;
  }

  return (
    <Container>
      <Typography gutterBottom variant='h5'>{subject.identifier}</Typography>
      <SessionTable
        sessions={sessions}
        onAdd={handleNewSession}
        onDelete={openAlert}
        onRowClick={handleSessionClick}
      />
      <SessionCreateDialog
        open={isDialogOpen}
        onCancel={handleCloseDialog}
        subject={subjectId}
      />
      <Alert
        open={isAlertOpen}
        title='Delete sessions'
        message='Do you really want to delete the selected sessions? This cannot be undone.'
        confirmText='Delete'
        onConfirm={handleDeleteSessions}
        onCancel={closeAlert}
      />
    </Container>
  );
}

SubjectDetail.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default SubjectDetail;
