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
import { tsObjectKeyword } from '@babel/types';

const useStyles = makeStyles(theme => ({
  item: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  itemIcon: {
    minWidth: 0,
  },
  itemTitle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  action: {
    top: theme.spacing(3),
    right: -theme.spacing(1),
  },
  downIcon: {
    transform: 'rotate(180deg)',
    transition: 'transform .5s',
  },
  downIconCollapsed: {
    transition: 'transform .5s',
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
        <ListItemIcon className={classes.itemIcon}>
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
            <ArrowDownIcon className={collapsed ? classes.downIconCollapsed : classes.downIcon} />
          </IconButton>
        </ListItemSecondaryAction>
      </div>
      <Collapse in={!collapsed}>
        {children}
      </Collapse>
    </ListItem>
  );
}
