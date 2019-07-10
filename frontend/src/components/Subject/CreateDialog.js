import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@material-ui/core'
import { createSubject } from '../../actions/subjects'

class SubjectCreateDialog extends PureComponent {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
  }

  state = {
    identifier: ''
  }

  handleCancel = (event) => {
    this.props.onCancel()
  }

  handleSave = (event) => {
    event.preventDefault()
    this.props.onSave(this.state.identifier)
    this.props.onCancel()
  }

  handleInputChange = (event) => {
    this.setState({ identifier: event.currentTarget.value })
  }

  render () {
    return (
      <Dialog open={this.props.open} fullWidth>
        <DialogTitle>Create Subject</DialogTitle>
        <form onSubmit={this.handleSave}>
          <DialogContent root={{ display: 'flex', flexWrap: 'wrap' }}>
            <TextField
              autoFocus
              label='Identifier'
              id='identifier'
              onChange={this.handleInputChange}
              fullWidth
              required
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

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSave: (identifier) => dispatch(createSubject({ identifier }))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubjectCreateDialog)
