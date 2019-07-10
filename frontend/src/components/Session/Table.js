import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import MaterialTable from 'material-table';
import AddIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/Delete';

function SessionTable ({ sessions, onAdd, onDelete, ...rest }) {
  const sessionArray = useMemo(() => Object.values(sessions), [sessions]);

  return (
    <MaterialTable
      {...rest}
      data={sessionArray}
      title='Sessions'
      options={{
        selection: true,
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
          render: rowData => moment(rowData.date).format('LL'),
        },
        {
          title: 'Created at',
          field: 'created_at',
          render: rowData => moment(rowData.created_at).format('LLL'),
        },
      ]}
    />
  );
}

SessionTable.propTypes = {
  sessions: PropTypes.array,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default SessionTable;
