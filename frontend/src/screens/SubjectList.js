import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import SubjectTable from '../components/Subject/Table';
import SubjectCreateDialog from '../components/Subject/CreateDialog';
import { Container } from '@material-ui/core';
import { getSubjectsArray } from '../selectors/data';
import * as Subjects from '../actions/subjects';

SubjectsScreen.propTypes = {
  history: PropTypes.object.isRequired,
};

function SubjectsScreen ({ history }) {
  const dispatch = useDispatch();
  const [ isDialogOpen, setDialogOpen ] = useState(false);
  const subjects = useSelector(getSubjectsArray);

  useEffect(() => {
    dispatch(Subjects.list());
  }, [dispatch]);

  const handleSubjectClick = (event, subject) => {
    history.push(`/subjects/${subject.id}`);
  };

  const handleNewSubject = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <Container>
      <SubjectTable
        subjects={subjects}
        onAdd={handleNewSubject}
        onRowClick={handleSubjectClick}
      />
      <SubjectCreateDialog open={isDialogOpen} onCancel={handleCloseDialog} />
    </Container>
  );
}

export default SubjectsScreen;
