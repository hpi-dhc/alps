import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Tabs, Tab, Divider } from '@material-ui/core';

const LinkTab = ({ value, ...props }) => {
  return (
    <Tab
      value={value}
      component={Link}
      to={value}
      {...props}
    />
  );
};

LinkTab.propTypes = {
  value: PropTypes.string.isRequired,
};

const SessionToolbar = ({ match, location }) => {
  const getUrl = (to) => {
    const url = `/sessions/${match.params.sessionId}`;
    return to ? `${url}/${to}` : url;
  };

  return (
    <React.Fragment>
      <Divider />
      <Tabs value={location.pathname}>
        <LinkTab
          label='Details'
          value={getUrl()}
        />
        <LinkTab
          label='Synchronization'
          value={getUrl('sync')}
        />
        <LinkTab
          label='Preprocessing'
          value={getUrl('preprocess')}
        />
        <LinkTab
          label='Analysis'
          value={getUrl('analyse')}
        />
      </Tabs>
    </React.Fragment>
  );
};

SessionToolbar.propTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default SessionToolbar;
