import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import MaterialTable from 'material-table';
import AddIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import StatusIcon, { PROCESS_STATUS } from '../Common/StatusIcon';
import DetailPanel from './DetailPanel';
import * as Datasets from '../../actions/datasets';
import { getSources } from '../../selectors/data';

DatasetTable.propTypes = {
  datasets: PropTypes.array.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

DatasetTable.defaultProps = {
  datasets: [],
};

function DatasetTable ({ datasets, onAdd, onDelete }) {
  const dispatch = useDispatch();
  const sources = useSelector(getSources);

  useEffect(() => {
    const toPoll = datasets
      .filter(each => [PROCESS_STATUS.QUEUED, PROCESS_STATUS.PROCESSING].includes(each.status))
      .map(each => each.id);
    toPoll.forEach(id => dispatch(Datasets.startPolling(id)));

    return () => toPoll.forEach(id => dispatch(Datasets.stopPolling(id)));
  }, [datasets, dispatch]);

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
          render: rowData => sources[rowData.source].name,
        },
        {
          title: 'Signals',
          field: 'signals',
          customSort: (a, b) => a.signals.length - b.signals.length,
          render: rowData => rowData.signals.length,
        },
        {
          title: 'Files',
          field: 'rawFiles',
          customSort: (a, b) => a.rawFiles.length - b.rawFiles.length,
          render: rowData => rowData.rawFiles.length,
        },
        {
          title: 'Created at',
          field: 'created_at',
          render: rowData => moment(rowData.created_at).format('LLL'),
        },
        {
          title: 'Status',
          field: 'status',
          render: (rowData) => <StatusIcon status={rowData.status} />,
        },
      ]}
    />
  );
};

export default DatasetTable;
