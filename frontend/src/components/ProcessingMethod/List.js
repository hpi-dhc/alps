import React, { useCallback } from 'react';
// import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { getInstalledProcessingMethods } from '../../selectors/data';
import { List } from '@material-ui/core';
import CollapsableItem from '../Common/CollapsableItem';
import OptionsGroup from './Options';
import { getSelectedMethods, getMethodConfigurations } from '../../selectors/analysis';
import * as Analysis from '../../actions/analysis';

export default function ProcessingMethodList () {
  const dispatch = useDispatch();
  const methods = useSelector(getInstalledProcessingMethods);
  const selectedMethods = useSelector(getSelectedMethods);
  const methodConfigurations = useSelector(getMethodConfigurations);

  const handleChange = useCallback((method, key, value) => {
    dispatch(Analysis.setConfigParameter(method, key, value));
  }, [dispatch]);

  const handleMethodSelect = useCallback((method, checked) => {
    if (checked) {
      dispatch(Analysis.addMethod(method));
    } else {
      dispatch(Analysis.removeMethod(method));
    }
  }, [dispatch]);

  const renderItem = (item) => {
    const checked = selectedMethods.includes(item.id);
    const configuration = methodConfigurations[item.id];
    return (
      <CollapsableItem
        checked={checked}
        onChange={(checked) => handleMethodSelect(item.id, checked)}
        key={item.id}
        title={item.name}
        disableGutters
      >
        { Object.keys(item.options).length > 0 &&
          <OptionsGroup
            item={item.options}
            onChange={(key, value) => handleChange(item.id, key, value)}
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
