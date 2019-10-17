import React, { useState, useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogActions, Button, makeStyles, DialogTitle } from '@material-ui/core';
import MaterialTable from 'material-table';
import DownloadIcon from '@material-ui/icons/CloudDownload';
import { getAnalysisLabels, getSubjects, getSessions } from '../../selectors/data';
import * as Subjects from '../../actions/subjects';
import * as Sessions from '../../actions/sessions';
import * as Analysis from '../../actions/analysis';

const useStyles = makeStyles(theme => ({
  leftIcon: {
    marginRight: theme.spacing(1),
  },
}));

ExportAnalysisResultsDialogContent.propTypes = {
  onClose: PropTypes.func.isRequired,
};

function ExportAnalysisResultsDialogContent ({ onClose: handleClose }) {
  const dispatch = useDispatch();
  const sessions = useSelector(getSessions);
  const subjects = useSelector(getSubjects);
  const analysisLabels = useSelector(getAnalysisLabels);
  const sessionData = useMemo(
    () => Object.values(sessions).map(each => ({
      id: each.id,
      session: each.title,
      subject: subjects[each.subject].identifier,
    })),
    [subjects, sessions],
  );
  const labelData = useMemo(() => Object.values(analysisLabels), [analysisLabels]);

  const pageSize = Math.min(20, Math.max(labelData.length, sessionData.length));
  const options = {
    grouping: false,
    selection: true,
    padding: 'dense',
    pageSize: pageSize,
    paging: pageSize === 20,
  };
  const components = {
    // eslint-disable-next-line react/prop-types
    Container: ({ children, ...props }) => <div {...props}>{children}</div>,
  };

  const [selectedSessions, setSelectedSessions] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const handleSessionSelection = (rows) => setSelectedSessions(rows.map(each => each.id));
  const handleLabelSelection = (rows) => setSelectedLabels(rows.map(each => each.id));

  const handleDownload = useCallback(() => {
    dispatch(Analysis.exportResults(selectedSessions, selectedLabels));
  }, [dispatch, selectedLabels, selectedSessions]);

  return (
    <React.Fragment>
      <DialogTitle>Export Analysis</DialogTitle>
      <DialogContent>
        <MaterialTable
          title='Sessions'
          data={sessionData}
          columns={[
            { title: 'Subject', field: 'subject' },
            { title: 'Session', field: 'session' },
          ]}
          components={components}
          onSelectionChange={handleSessionSelection}
          options={options}
        />
        <MaterialTable
          title='Labels'
          data={labelData}
          columns={[
            { title: 'Name', field: 'name' },
          ]}
          components={components}
          onSelectionChange={handleLabelSelection}
          options={options}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button onClick={handleDownload}>Download</Button>
      </DialogActions>
    </React.Fragment>
  );
};

function ExportAnalysisResultsDialog (props) {
  const classes = useStyles();
  const [isOpen, setOpen] = useState(false);
  const dispatch = useDispatch();

  const openDialog = () => setOpen(true);

  const closeDialog = () => setOpen(false);

  useEffect(() => {
    if (isOpen) {
      dispatch(Subjects.list());
      dispatch(Sessions.list());
    }
  }, [dispatch, isOpen]);

  return (
    <React.Fragment>
      <Button
        onClick={openDialog}
        variant='contained'
        {...props}
      >
        <DownloadIcon className={classes.leftIcon} />
        Export Analysis
      </Button>
      <Dialog
        open={isOpen}
        fullWidth
        {...props}
      >
        <ExportAnalysisResultsDialogContent onClose={closeDialog} />
      </Dialog>
    </React.Fragment>
  );
};

export default ExportAnalysisResultsDialog;
