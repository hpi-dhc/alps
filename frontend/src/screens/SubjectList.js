import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import SubjectTable from '../components/Subject/Table';
import SubjectCreateDialog from '../components/Subject/CreateDialog';
import { Container } from '@material-ui/core';
import { getSubjectsArray } from '../selectors/data';
import * as Subjects from '../actions/subjects';
import Alert from '../components/Common/Alert';

SubjectsScreen.propTypes = {
  history: PropTypes.object.isRequired,
};

function SubjectsScreen ({ history }) {
  const dispatch = useDispatch();
  const [ isDialogOpen, setDialogOpen ] = useState(false);
  const [ isAlertOpen, setAlertOpen ] = useState(false);
  const [ subjectsToDelete, setSubjectsToDelete ] = useState([]);
  const subjects = useSelector(getSubjectsArray);

  useEffect(() => {
    dispatch(Subjects.list());
  }, [dispatch]);

  const handleSubjectClick = (event, subject) => {
    history.push(`/subjects/${subject.id}`);
  };

  const handleDeleteSubjects = useCallback(
    () => {
      subjectsToDelete.forEach(each => dispatch(Subjects.destroy(each.id)));
      closeAlert();
    },
    [dispatch, subjectsToDelete]
  );

  const handleNewSubject = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const openAlert = (data) => {
    setSubjectsToDelete(data);
    setAlertOpen(true);
  };

  const closeAlert = () => {
    setAlertOpen(false);
  };

  return (
    <Container>
      <SubjectTable
        subjects={subjects}
        onAdd={handleNewSubject}
        onDelete={openAlert}
        onRowClick={handleSubjectClick}
      />
      <SubjectCreateDialog open={isDialogOpen} onCancel={handleCloseDialog} />
      <Alert
        open={isAlertOpen}
        title='Delete subjects'
        message='Do you really want to delete the selected subjects? This cannot be undone.'
        confirmText='Delete'
        onConfirm={handleDeleteSubjects}
        onCancel={closeAlert}
      />
    </Container>
  );
}

export default SubjectsScreen;
