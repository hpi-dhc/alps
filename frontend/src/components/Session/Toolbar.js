import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { makeStyles, Tabs, Tab } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
}))

const LinkTab = ({ value, ...props }) => {
  return (
    <Tab
      value={value}
      component={Link}
      to={value}
      {...props}
    />
  )
}

LinkTab.propTypes = {
  value: PropTypes.string.isRequired
}

const SessionToolbar = ({ match }) => {
  const classes = useStyles()

  const getUrl = (to) => {
    const url = `/sessions/${match.params.sessionId}`
    return to ? `${url}/${to}` : url
  }

  return (
    <Tabs value={match.url} className={classes.tabs}>
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
  )
}

SessionToolbar.propTypes = {
  match: PropTypes.object.isRequired
}

export default SessionToolbar
