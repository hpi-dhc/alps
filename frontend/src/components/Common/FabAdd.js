import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { Fab } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'

const useStyles = makeStyles(theme => ({
  fab: {
    margin: theme.spacing(1),
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2)
  },
  extendedIcon: {
    marginRight: theme.spacing(1)
  }
}))

const FabAdd = ({ onClick, label }) => {
  const classes = useStyles()

  return (
    <Fab
      variant='extended'
      color='accent'
      className={classes.fab}
      onClick={onClick}
    >
      <AddIcon className={classes.extendedIcon} />
      {label}
    </Fab>
  )
}

FabAdd.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
}

export default FabAdd
