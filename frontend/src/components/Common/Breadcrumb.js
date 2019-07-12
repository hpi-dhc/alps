import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles, Typography, IconButton } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { withRouter } from 'react-router-dom';
import { getSubjects, getSessions } from '../../selectors/data';

class Breadcrumb extends React.PureComponent {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    subjects: PropTypes.object.isRequired,
    sessions: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  }

  state = {
    title: '',
    goBackTo: '',
  }

  componentWillReceiveProps (nextProps) {
    const { subjects, sessions } = nextProps;
    const { pathname } = nextProps.location;
    if (pathname.startsWith('/subjects')) {
      const match = pathname.match(/^\/subjects\/([a-z0-9-]+)/);
      const subject = subjects[match[1]];
      const title = subject ? subject.identifier : '';
      this.setState({ title, goBackTo: '/' });
    } else if (pathname.startsWith('/sessions')) {
      const match = pathname.match(/^\/sessions\/([a-z0-9-]+)/);
      const session = sessions[match[1]];
      const title = session ? session.title : '';
      this.setState({ title, goBackTo: `/subjects/${session.subject}` });
    } else {
      this.setState({ title: '', goBackTo: '' });
    }
  }

  handleGoBack = () => {
    this.props.history.push(this.state.goBackTo);
  }

  render () {
    const { classes } = this.props;
    const { title, goBackTo } = this.state;

    return (
      <React.Fragment>
        { !!goBackTo &&
          <IconButton color='inherit' onClick={this.handleGoBack}>
            <ArrowBackIcon />
          </IconButton>
        }
        <Typography className={classes.breadcrumbs} noWrap>{title}</Typography>
      </React.Fragment>
    );
  }
}

const styles = theme => ({
  breadcrumbs: {
    flexGrow: 1,
  },
});

const mapStateToProps = (state) => {
  return {
    subjects: getSubjects(state),
    sessions: getSessions(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

const BreadcrumbStyled = withStyles(styles)(Breadcrumb);
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BreadcrumbStyled));
