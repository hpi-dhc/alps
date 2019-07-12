import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  makeStyles,
  Typography,
  TextField,
  InputBase,
  Button,
} from '@material-ui/core';
import FileIcon from '@material-ui/icons/InsertDriveFileOutlined';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  icon: {
    marginTop: theme.spacing(0.5),
  },
  itemMain: {
    display: 'inline-flex',
    flexDirection: 'column',
    marginTop: theme.spacing(0.5),
    padding: `0 ${theme.spacing(2)}px`,
    flexGrow: 1,
    overflow: 'hidden',
  },
  itemMetaInput: {
    paddingTop: theme.spacing(1),
  },
  button: {
    flexShrink: 0,
  },
  inputWrapper: {
    width: 1,
    height: 1,
  },
  fileInput: {
    padding: 0,
    width: 1,
    height: 1,
  },
}));

function UploadItem ({ id, required, options, onChange }) {
  const classes = useStyles();
  const fileInputRef = useRef();
  const filename = useFilename(fileInputRef);

  const renderLabel = () => {
    let label = options.label || 'File';
    if (required) label += ' *';
    label += ': ';
    label += filename || 'No file chosen';
    return label;
  };

  return (
    <div className={classes.container}>
      <FileIcon className={classes.icon} />
      <div className={classes.itemMain}>
        <Typography noWrap>{renderLabel()}</Typography>
        {
          options.timestamp &&
          <TextField
            label='Timestamp'
            id={`${id}-timestamp`}
            type='datetime-local'
            onChange={onChange}
            InputLabelProps={{
              shrink: true,
              className: classes.itemMetaInput,
            }}
            fullWidth
          />
        }
      </div>
      <Button
        component='label'
        variant='outlined'
        className={classes.button}
      >
        Choose File
        <InputBase
          id={`${id}-file`}
          name={options.label}
          type='file'
          className={classes.inputWrapper}
          inputProps={{ className: classes.fileInput }}
          inputRef={fileInputRef}
          onChange={onChange}
          required={required}
        />
      </Button>
    </div>
  );
}

UploadItem.propTypes = {
  id: PropTypes.string.isRequired,
  options: PropTypes.object,
  required: PropTypes.bool,
  onChange: PropTypes.func,
};

export default UploadItem;

function useFilename (inputRef) {
  const [filename, setFilename] = useState(null);

  const handleEvent = (event) => {
    if (event.type === 'change' && event.target.files.length) {
      setFilename(event.target.files[0].name);
    } else {
      setFilename(null);
    }
  };

  useEffect(() => {
    const { current: input } = inputRef;
    const form = input.form;
    if (input) {
      input.addEventListener('change', handleEvent);
      form.addEventListener('reset', handleEvent);
      return () => {
        input.removeEventListener('change', handleEvent);
        form.removeEventListener('reset', handleEvent);
      };
    }
  }, [inputRef]);

  return filename;
}
