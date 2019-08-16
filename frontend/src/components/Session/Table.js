import React from 'react';
import PropTypes from 'prop-types';
import formatDate from 'date-fns/format';
import MaterialTable from 'material-table';
import AddIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/Delete';

SessionTable.propTypes = {
  sessions: PropTypes.array.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

SessionTable.defaultProps = {
  sessions: [],
};

function SessionTable ({ sessions, onAdd, onDelete, ...rest }) {
  return (
    <MaterialTable
      {...rest}
      data={sessions}
      title='Sessions'
      options={{
        selection: true,
        pageSize: sessions.length > 10 ? 20 : 10,
        pageSizeOptions: [10, 20, 50, 100],
      }}
      actions={[
        {
          icon: () => <AddIcon />,
          tooltip: 'Create session',
          isFreeAction: true,
          onClick: onAdd,
        },
        {
          icon: () => <DeleteIcon />,
          tooltip: 'Delete selected sessions',
          onClick: (_, data) => onDelete(data),
        },
      ]}
      columns={[
        {
          title: 'Title',
          field: 'title',
        },
        {
          title: 'Date',
          field: 'date',
          render: rowData => formatDate(new Date(rowData.date), 'MMMM dd, yyyy'),
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

export default SessionTable;
