import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getInstalledProcessingMethods } from '../../selectors/data';
import { List } from '@material-ui/core';
import CollapsableItem from '../Common/CollapsableItem';
import OptionsGroup from './Options';
import { filterObjectByValue } from '../../utils';

ProcessingMethodList.propTypes = {
  types: PropTypes.arrayOf(PropTypes.string),
  selected: PropTypes.array,
  configurations: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

ProcessingMethodList.defaultProps = {
  selected: [],
  configurations: {},
};

export default function ProcessingMethodList ({ types, selected, configurations, onSelect, onChange }) {
  let methods = useSelector(getInstalledProcessingMethods);
  if (types) {
    methods = filterObjectByValue(methods, (each) => types.includes(each.type));
  }

  const renderItem = (item) => {
    const checked = selected.includes(item.id);
    const configuration = configurations[item.id];
    return (
      <CollapsableItem
        checked={checked}
        onChange={(checked) => onSelect(item.id, checked)}
        key={item.id}
        title={item.name}
        disableGutters
      >
        { Object.keys(item.options).length > 0 &&
          <OptionsGroup
            item={item.options}
            onChange={(key, value) => onChange(item.id, key, value)}
            values={configuration}
          />
        }
      </CollapsableItem>
    );
  };

  return (
    <List disablePadding>
      {Object.values(methods).map(renderItem)}
    </List>
  );
};
