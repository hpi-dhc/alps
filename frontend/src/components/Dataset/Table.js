import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import MaterialTable from 'material-table';
import AddIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import StatusIcon, { AutoReloadStatusIcon } from '../Common/StatusIcon';
import DetailPanel from './DetailPanel';

const DatasetTable = ({ datasets, onAdd, onDelete }) => {
  return (
    <MaterialTable
      data={datasets}
      title='Datasets'
      options={{
        actionsColumnIndex: 6,
        selection: true,
      }}
      actions={[
        {
          icon: () => <AddIcon />,
          tooltip: 'Create dataset',
          isFreeAction: true,
          onClick: onAdd,
        },
        {
          icon: () => <DeleteIcon />,
          tooltip: 'Delete selected datasets',
          onClick: (_, data) => onDelete(data),
        },
      ]}
      detailPanel={(rowData) => <DetailPanel dataset={rowData} />}
      columns={[
        {
          title: 'Title',
          field: 'title',
        },
        {
          title: 'Source',
          field: 'source',
          emptyValue: 'Raw files',
        },
        {
          title: 'Signals',
          field: 'signals',
          customSort: (a, b) => a.signals.length - b.signals.length,
          render: rowData => rowData.signals.length,
        },
        {
          title: 'Files',
          field: 'raw_files',
          customSort: (a, b) => a.raw_files.length - b.raw_files.length,
          render: rowData => rowData.raw_files.length,
        },
        {
          title: 'Created at',
          field: 'created_at',
          render: rowData => moment(rowData.created_at).format('LLL'),
        },
        {
          title: 'Status',
          field: 'status',
          render: (rowData) => {
            if (rowData.status === 'UP' || rowData.status === 'PR') {
              return <AutoReloadStatusIcon id={rowData.id} />;
            } else {
              return <StatusIcon status={rowData.status} />;
            }
          },
        },
      ]}
    />
  );
};

DatasetTable.propTypes = {
  datasets: PropTypes.array,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default DatasetTable;
