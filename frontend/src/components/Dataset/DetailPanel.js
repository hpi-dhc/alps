import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  makeStyles,
  Typography,
  Grid
} from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2)
  },
  item: {
    flexGrow: 1
  }
}))

function DetailPanel ({ dataset }) {
  const classes = useStyles()

  return (
    <Grid
      container
      className={classes.container}
      spacing={2}
    >
      <Grid item className={classes.item}>
        <Typography variant='body2'>Signals</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align='right'>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataset.signals.map(each => (
              <TableRow key={each.id}>
                <TableCell component='th' scope='row'>
                  {each.name}
                </TableCell>
                <TableCell align='right'>
                  {each.type}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
      <Grid item className={classes.item}>
        <Typography variant='body2'>Files</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align='right'>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataset.raw_files.map(each => (
              <TableRow key={each.id}>
                <TableCell component='th' scope='row'>
                  {each.name}
                </TableCell>
                <TableCell align='right'>
                  {each.timestamp &&
                    moment(each.timestamp).format('LLL')
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  )
}

DetailPanel.propTypes = {
  dataset: PropTypes.object.isRequired
}

export default DetailPanel
