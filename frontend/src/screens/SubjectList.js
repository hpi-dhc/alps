import React, { useState } from 'react'
import PropTypes from 'prop-types'
import SubjectTable from '../components/Subject/Table'
import SubjectCreateDialog from '../components/Subject/CreateDialog'
import { useAppBarTitle } from '../components/Common/AppBar'
import { Container } from '@material-ui/core'
import { useSubjects } from '../api/subjects'

function SubjectsScreen ({ history }) {
  const [ isDialogOpen, setDialogOpen ] = useState(false)
  const { data: subjects, isLoading } = useSubjects()

  useAppBarTitle(null)

  const handleSubjectClick = (event, subject) => {
    history.push(`/subjects/${subject.id}`)
  }

  const handleNewSubject = () => {
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  return (
    <Container>
      <SubjectTable
        subjects={subjects}
        isLoading={isLoading}
        onAdd={handleNewSubject}
        onRowClick={handleSubjectClick}
      />
      <SubjectCreateDialog open={isDialogOpen} onCancel={handleCloseDialog} />
    </Container>
  )
}

SubjectsScreen.propTypes = {
  history: PropTypes.object.isRequired
}

export default SubjectsScreen
