import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Tabs, Tab, Divider } from '@material-ui/core';
import { getSessions } from '../../selectors/data';

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
  const session = useSelector(getSessions)[match.params.sessionId];
  const sessionAvailable = Boolean(session);
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
          disabled={!sessionAvailable || session.datasets.length < 2}
        />
        <LinkTab
          label='Preprocessing'
          value={getUrl('preprocess')}
          disabled={!sessionAvailable}
        />
        <LinkTab
          label='Analysis'
          value={getUrl('analyse')}
          disabled={!sessionAvailable}
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
