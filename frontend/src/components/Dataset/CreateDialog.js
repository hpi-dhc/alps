import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  makeStyles,
  Divider,
  FormHelperText,
} from '@material-ui/core';
import RawFileUploadItem from '../RawFile/UploadItem';
import { useSources } from '../../api/sources';

const useStyles = makeStyles(theme => ({
  input: {
    display: 'block',
    marginBottom: theme.spacing(2),
  },
  divider: {
    margin: `${theme.spacing(2)}px 0`,
  },
}));

const rawFileOptions = { label: 'File', timestamp: true };

function DatasetCreateDialog ({ open, session, onCancel, onSave }) {
  const formId = 'create-dataset-form';
  const classes = useStyles();
  const formRef = useRef();
  const { data: sources } = useSources();
  const installedSources = useMemo(
    () => Object.values(sources).filter(each => each.installed),
    [sources]
  );

  const [title, setTitle] = useState('');
  const [source, setSource] = useState('raw');
  const [files, setFiles] = useState({});
  const [fileOptions, setFileOptions] = useState([rawFileOptions]);
  const [isFilesEmptyError, setFilesEmptyError] = useState(false);

  // reset dialog when opened
  useEffect(() => {
    if (open) {
      setTitle('');
      setSource('raw');
      setFiles({});
      setFileOptions([rawFileOptions]);
    }
  }, [open]);

  // add new upload item for raw source
  useEffect(() => {
    const filesArray = Object.values(files);
    if (source === 'raw' && filesArray.length === fileOptions.length &&
      filesArray.every(value => !!value.file)) {
      setFileOptions([...fileOptions, rawFileOptions]);
    }
  }, [source, files, fileOptions]);

  const handleSave = (event) => {
    event.preventDefault();
    if (Object.values(files).every(file => !file.file)) {
      setFilesEmptyError(true);
      return;
    } else {
      setFilesEmptyError(false);
    }
    onSave({
      session,
      source: source === 'raw' ? null : source,
      title,
      files,
    });
  };

  const handleTitleChange = (event) => {
    setTitle(event.currentTarget.value);
  };

  const handleSourceChange = (event) => {
    const newSource = event.target.value;
    if (newSource !== source) {
      formRef.current.reset();
      setSource(newSource);
      setFiles({});
      if (newSource === 'raw') {
        setFileOptions([rawFileOptions]);
      } else {
        const source = installedSources.find(one => one.id === newSource);
        setFileOptions(source.fileOptions);
      }
    }
  };

  const handleFileChange = (event) => {
    const targetId = event.target.id;
    const [ id, type ] = targetId.split('-');
    const value = type === 'file' ? event.target.files[0] : event.target.value;
    setFiles({
      ...files,
      [id]: {
        ...files[id],
        [type]: value,
      },
    });
  };

  const renderFileInput = (file, index) => {
    const isNotFirstItem = index !== 0;
    const { required, ...options } = file;
    const id = `file${index}`;
    return (
      <div key={id}>
        {isNotFirstItem && <Divider className={classes.divider} />}
        <RawFileUploadItem
          id={id}
          required={required}
          options={options}
          onChange={handleFileChange}
        />
      </div>
    );
  };

  const renderSourceSelectItem = (source) => {
    return <MenuItem key={source.id} value={source.id}>{source.name}</MenuItem>;
  };

  return (
    <Dialog open={open} fullWidth>
      <DialogTitle>Create Dataset</DialogTitle>
      <DialogContent>
        <form id={formId} onSubmit={handleSave} ref={formRef}>
          <TextField
            className={classes.input}
            autoFocus
            label='Title'
            id='title'
            value={title}
            onChange={handleTitleChange}
            required
            fullWidth
          />
          <FormControl className={classes.input} required>
            <InputLabel htmlFor='source'>Source</InputLabel>
            <Select
              onChange={handleSourceChange}
              value={source}
              name='source'
              inputProps={{ id: 'source' }}
              fullWidth
            >
              <MenuItem value={'raw'}>Raw files</MenuItem>
              {installedSources.map(renderSourceSelectItem)}
            </Select>
          </FormControl>
          {fileOptions.map(renderFileInput)}
          <FormHelperText error hidden={!isFilesEmptyError}>
            Cannot create empty dataset. Choose at least one file.
          </FormHelperText>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} form={formId}>Cancel</Button>
        <Button type='submit' color='secondary' form={formId}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

DatasetCreateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  session: PropTypes.string.isRequired,
};

export default React.memo(DatasetCreateDialog);
