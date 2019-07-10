import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  withStyles
} from '@material-ui/core'
import { createSession } from '../../actions/sessions'

class SessionCreateDialog extends PureComponent {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    subject: PropTypes.string.isRequired
  }

  state = {
    title: '',
    date: null
  }

  handleCancel = (event) => {
    this.props.onCancel()
  }

  handleSave = (event) => {
    event.preventDefault()
    const { title, date } = this.state
    const { subject, onSave, onCancel } = this.props
    onSave({ subject, title, date })
    onCancel()
  }

  handleInputChange = (event) => {
    const { id, value } = event.currentTarget
    this.setState({ ...this.state, [id]: value })
  }

  render () {
    const { classes } = this.props

    return (
      <Dialog open={this.props.open} fullWidth>
        <DialogTitle>Create Session</DialogTitle>
        <form onSubmit={this.handleSave}>
          <DialogContent>
            <TextField
              autoFocus
              label='Title'
              id='title'
              onChange={this.handleInputChange}
              className={classes.input}
              required
              fullWidth
            />
            <TextField
              label='Date'
              id='date'
              type='date'
              onChange={this.handleInputChange}
              className={classes.input}
              required
              fullWidth
              InputLabelProps={{
                shrink: true
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCancel}>Cancel</Button>
            <Button type='submit' color='secondary'>Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    )
  }
}

const styles = theme => ({
  input: {
    display: 'block',
    marginBottom: theme.spacing(2)
  }
})

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSave: (data) => dispatch(createSession(data))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SessionCreateDialog))
