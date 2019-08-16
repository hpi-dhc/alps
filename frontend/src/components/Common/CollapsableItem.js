import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  makeStyles,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Collapse,
  Checkbox,
  ListItemIcon,
} from '@material-ui/core';
import ArrowDownIcon from '@material-ui/icons/ArrowDropDown';

const useStyles = makeStyles(theme => ({
  item: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  itemTitle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  action: {
    top: '24px',
  },
}));

CollapsableItem.propTypes = {
  title: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func,
  children: PropTypes.node,
};

export default function CollapsableItem ({ title, checked, onChange, children, ...props }) {
  const classes = useStyles();
  const [collapsed, setCollapsed] = useState(true);

  const handleToggleCollapsed = () => {
    setCollapsed(prev => !prev);
  };

  const handleCheckbox = (_, checked) => {
    if (onChange) onChange(checked);
  };

  return (
    <ListItem className={classes.item} {...props}>
      <div className={classes.itemTitle}>
        <ListItemIcon>
          <Checkbox
            edge='start'
            checked={checked}
            onChange={handleCheckbox}
            disableRipple
          />
        </ListItemIcon>
        <ListItemText>{title}</ListItemText>
        <ListItemSecondaryAction className={classes.action} hidden={!children}>
          <IconButton onClick={handleToggleCollapsed}>
            <ArrowDownIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </div>
      <Collapse in={!collapsed}>
        {children}
      </Collapse>
    </ListItem>
  );
}
