import React from 'react';
import PropTypes from 'prop-types';
import formatDate from 'date-fns/format';
import MaterialTable from 'material-table';
import AddIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/Delete';

SubjectTable.propTypes = {
  subjects: PropTypes.array,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

SubjectTable.defaultProps = {
  subjects: [],
};

function SubjectTable ({ subjects, onAdd, onDelete, ...rest }) {
  return (
    <MaterialTable
      {...rest}
      data={subjects}
      title='Subjects'
      options={{
        selection: true,
        pageSize: subjects.length > 10 ? 20 : 10,
        pageSizeOptions: [10, 20, 50, 100],
      }}
      actions={[
        {
          icon: () => <AddIcon />,
          tooltip: 'Create subject',
          isFreeAction: true,
          onClick: onAdd,
        },
        {
          icon: () => <DeleteIcon />,
          tooltip: 'Delete selected subjects',
          onClick: (_, data) => onDelete(data),
        },
      ]}
      columns={[
        {
          title: 'ID',
          field: 'identifier',
        },
        {
          title: 'Sessions',
          field: 'sessions',
          render: rowData => rowData.sessions.length,
        },
        {
          title: 'Created at',
          field: 'created_at',
          render: rowData => formatDate(new Date(rowData.created_at), 'MMMM dd, yyyy HH:mm'),
        },
      ]}
    />
  );
}

export default SubjectTable;
