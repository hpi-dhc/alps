import React from 'react';
import PropTypes from 'prop-types';
import {
  Checkbox,
  Typography,
  Box,
  Input,
  FormControl,
  InputLabel,
  InputAdornment,
  makeStyles,
  Select,
  MenuItem,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  group: {
    border: '1px solid',
    borderColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
  },
  option: {
    marginBottom: theme.spacing(1),
    '&:last-child': {
      marginBottom: 0,
    },
  },
  rangeSpacer: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
}));

function getComponent (type) {
  switch (type) {
    case 'boolean': return OptionsBoolean;
    case 'number': return OptionsNumber;
    case 'range': return OptionsRange;
    case 'select': return OptionsSelect;
    default: throw Error(`Invalid options type: ${type}`);
  }
};

const OptionsPropTypes = {
  id: PropTypes.string,
  item: PropTypes.object.isRequired,
  values: PropTypes.object,
  onChange: PropTypes.func,
};

OptionsGroup.propTypes = OptionsPropTypes;
OptionsGroup.defaultProps = {
  id: '',
  values: {},
};

export default function OptionsGroup ({ id, item, values, onChange }) {
  const classes = useStyles();

  if (item.hasOwnProperty('options')) {
    item = item.options;
  }

  const renderOption = ([key, item]) => {
    const Component = getComponent(item.type);
    const composedId = id ? `${id}-${key}` : key;
    return <Component
      key={key}
      id={composedId}
      item={item}
      onChange={onChange}
      values={values}
      className={classes.option}
    />;
  };

  return (
    <div className={classes.group}>
      {Object.entries(item).map(renderOption)}
    </div>
  );
};

OptionsBoolean.propTypes = OptionsPropTypes;
OptionsBoolean.defaultProps = { values: {} };
export function OptionsBoolean ({ id, item, values, onChange, ...rest }) {
  const checked = typeof values[id] !== 'undefined' ? values[id] : item.default;

  const handleChange = (event, checked) => {
    if (onChange) onChange(id, checked);
  };

  return (
    <Box display='flex' alignItems='center' {...rest}>
      <Checkbox
        checked={checked}
        onChange={handleChange}
        color='default'
        disableRipple
      />
      <Typography variant='body2'>{item.title}</Typography>
    </Box>
  );
};

OptionsNumber.propTypes = OptionsPropTypes;
OptionsNumber.defaultProps = { values: {} };
export function OptionsNumber ({ id, item, values, onChange, ...rest }) {
  const value = typeof values[id] !== 'undefined' ? values[id] : item.default;

  let inputProps = {};
  if (item.limits) {
    inputProps = {
      min: item.limits[0],
      max: item.limits[1],
    };
  }

  const handleChange = (event) => {
    if (onChange) onChange(id, Number(event.target.value));
  };

  return (
    <Box display='flex' alignItems='center' {...rest}>
      <FormControl fullWidth>
        <InputLabel>{item.title}</InputLabel>
        <Input
          value={value}
          onChange={handleChange}
          type='number'
          inputProps={inputProps}
          endAdornment={
            <InputAdornment position='end' hidden={!item.unit}>
              {item.unit}
            </InputAdornment>
          }
        />
      </FormControl>
    </Box>
  );
};

OptionsRange.propTypes = OptionsPropTypes;
OptionsRange.defaultProps = { values: {} };
export function OptionsRange ({ id, item, values: valuesProp, onChange, ...rest }) {
  const classes = useStyles();
  const values = valuesProp[id] ? valuesProp[id] : item.default;

  let inputProps = {};
  if (item.limits) {
    inputProps = {
      min: item.limits[0],
      max: item.limits[1],
    };
  }

  const handleChange = (event) => {
    const index = event.target.name === 'lower' ? 0 : 1;
    const newValues = [...values];
    newValues[index] = Number(event.target.value);
    if (onChange) onChange(id, newValues);
  };

  return (
    <div {...rest}>
      <Typography variant='caption' color='textSecondary'>{item.title}</Typography>
      <Box display='flex' alignItems='center'>
        <FormControl required fullWidth>
          <Input
            name='lower'
            value={values[0]}
            type='number'
            onChange={handleChange}
            endAdornment={
              <InputAdornment position='end' hidden={!item.unit}>
                {item.unit}
              </InputAdornment>
            }
            inputProps={inputProps}
          />
        </FormControl>
        <div className={classes.rangeSpacer}>
          -
        </div>
        <FormControl required fullWidth>
          <Input
            name='upper'
            value={values[1]}
            type='number'
            onChange={handleChange}
            endAdornment={
              <InputAdornment position='end' hidden={!item.unit}>
                {item.unit}
              </InputAdornment>
            }
            inputProps={inputProps}
          />
        </FormControl>
      </Box>
    </div>
  );
};

OptionsSelect.propTypes = OptionsPropTypes;
OptionsSelect.defaultProps = { values: {} };
export function OptionsSelect ({ id, item, values, onChange, ...rest }) {
  const value = values[id] ? values[id] : item.default;

  const handleChange = (event) => {
    if (onChange) onChange(id, event.target.value);
  };

  return (
    <FormControl {...rest}>
      <InputLabel>{item.title}</InputLabel>
      <Select
        value={value}
        onChange={handleChange}
      >
        { item.items.map(({ title, value }) => <MenuItem key={value} value={value}>{title}</MenuItem>) }
      </Select>
    </FormControl>
  );
};
