import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import SessionTable from '../components/Session/Table';
import SessionCreateDialog from '../components/Session/CreateDialog';
import { useAppBarTitle } from '../components/Common/AppBar';
import { Container } from '@material-ui/core';
import { useSubjects } from '../api/subjects';
import { useSessionsOfSubject, deleteSession } from '../api/sessions';

function SubjectDetail ({ match, history }) {
  const subjectId = match.params.subjectId;
  const [ isDialogOpen, setDialogOpen ] = useState(false);

  const { data: subject } = useSubjects(subjectId);
  const { data: sessions, isLoading, reload } = useSessionsOfSubject(subjectId);

  useAppBarTitle(subject.identifier);

  const handleSessionClick = (_, session) => {
    history.push(`/sessions/${session.id}`);
  };

  const handleDeleteSessions = useCallback(
    async (sessions) => {
      for (let each of sessions) {
        try {
          await deleteSession(each.id);
        } catch (error) {
          console.log('Failed deleteing session', each.id);
        }
      }
      reload();
    },
    [reload]
  );

  const handleNewSession = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <Container>
      <SessionTable
        sessions={sessions}
        isLoading={isLoading}
        onAdd={handleNewSession}
        onDelete={handleDeleteSessions}
        onRowClick={handleSessionClick}
      />
      <SessionCreateDialog
        open={isDialogOpen}
        onCancel={handleCloseDialog}
        subject={subjectId}
      />
    </Container>
  );
}

SubjectDetail.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default SubjectDetail;
