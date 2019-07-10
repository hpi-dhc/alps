import React from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router-dom'
import AppBar from '../components/Common/AppBar'
import { makeStyles, CssBaseline } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex'
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    height: '100vh',
    overflow: 'auto'
  }
}))

function DefaultLayout ({ component: Component, ...props }) {
  const classes = useStyles()

  return (
    <Route {...props} render={matchProps => (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar />
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Component {...matchProps} />
        </main>
      </div>
    )} />
  )
}

DefaultLayout.propTypes = {
  component: PropTypes.any.isRequired
}

export default DefaultLayout
