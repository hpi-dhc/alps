import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import MaterialTable from 'material-table'
import AddIcon from '@material-ui/icons/AddCircle'
import DeleteIcon from '@material-ui/icons/Delete'

function SubjectTable ({ subjects, onAdd, ...rest }) {
  return (
    <MaterialTable
      {...rest}
      data={subjects}
      title='Subjects'
      options={{
        selection: true
      }}
      actions={[
        {
          icon: () => <AddIcon />,
          tooltip: 'Create subject',
          isFreeAction: true,
          onClick: onAdd
        },
        {
          icon: () => <DeleteIcon />,
          tooltip: 'Delete selected subjects',
          onClick: (_, data) => alert(`In the future this will delete ${data.length} rows`)
        }
      ]}
      columns={[
        {
          title: 'ID',
          field: 'identifier'
        },
        {
          title: 'Sessions',
          field: 'sessions',
          render: rowData => rowData.sessions.length
        },
        {
          title: 'Created at',
          field: 'created_at',
          render: rowData => moment(rowData.created_at).format('LLL')
        }
      ]}
    />
  )
}

SubjectTable.propTypes = {
  subjects: PropTypes.array,
  onAdd: PropTypes.func.isRequired
}

export default SubjectTable
