import React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {Typography, Popover, List, ListItem, Avatar, ListItemText, Toolbar, IconButton, Tooltip} from '@material-ui/core';
import MareyChart from './MareyChart';
import SolutionMap from './SolutionMap';
import classNames from 'classnames';
import SolutionStats from './SolutionStats';
import SolutionNode from '../model/SolutionNode';
import Error from '@material-ui/icons/Error';
import Bookmark from '@material-ui/icons/Bookmark';
import BookmarkBorder from '@material-ui/icons/BookmarkBorder';
import Close from '@material-ui/icons/Close';
import {bind} from 'decko';
import {toDistance} from '../utils';
import SolutionState from './SolutionState';

const styles = (_theme: Theme) => createStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0.5rem',
    padding: '0.5rem',
    border: '1px solid lightgray',
    borderRadius: 5
  },
  error: {
    backgroundColor: _theme.palette.error.main
  },
  header: {
    display: 'flex',
  },
  spacer: {
    flex: '1 1 0'
  },
  main: {
    flex: '1 1 0',
    display: 'flex',

    '& > *': {
      flex: '1 1 0',
      margin: '0 0.5em'
    }
  },
  selected: {
    boxShadow: '0 0 5px 3px orange'
  },
  right: {
    flexDirection: 'row-reverse'
  }
});



export interface ISolutionProps extends WithStyles<typeof styles>, IWithStore {
  className?: string;
  solution: SolutionNode | null;
  orientation: 'left' | 'right';
}


@inject('store')
@observer
class Solution extends React.Component<ISolutionProps> {
  @bind
  private openViolationList(evt: React.MouseEvent<HTMLElement>) {
    const store = this.props.store!.ui;
    store.visibleViolationSolution = this.props.solution;
    store.visibleViolationAnchor = evt.currentTarget;
  }

  @bind
  private closeViolationList() {
    const store = this.props.store!.ui;
    store.visibleViolationSolution = null;
    store.visibleViolationAnchor = null;
  }

  render() {
    const {classes, solution, orientation} = this.props;
    const store = this.props.store!;

    if (!solution) {
      return <div className={classNames(classes.root, this.props.className)}>
        <Typography variant="h6">No Solution Selected</Typography>
      </div>;
    }

    return <div className={classNames(classes.root, this.props.className, {[classes.selected]: store.hoveredSolution === solution})}
      onMouseEnter={() => store.hoveredSolution = solution}
      onMouseLeave={() => store.hoveredSolution = null}>
      <Toolbar disableGutters variant="dense" className={classes.header}>
        <Typography variant="h6">{solution.name} ({toDistance(solution.distance)})</Typography>
        <SolutionState solution={solution} />
        <Tooltip title={store.isInGallery(solution) ? `Remove solution from gallery` : `Add solution to gallery`}>
          <IconButton onClick={() => store.toggleInGallery(solution)}>{store.isInGallery(solution) ? <Bookmark /> : <BookmarkBorder />}</IconButton>
        </Tooltip>
        <div className={classes.spacer} />
        {solution.valid ? null : <React.Fragment>
          <Tooltip title="Click to show details">
            <Typography color="error" onClick={this.openViolationList}>{solution.violations.length} violation{solution.violations.length > 1 ? 's' : ''}</Typography>
          </Tooltip>
          <Popover anchorEl={store.ui.visibleViolationAnchor}
            open={store.ui.visibleViolationAnchor != null && store.ui.visibleViolationSolution === solution}
            onClose={this.closeViolationList}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}>
            <List className={this.props.className}>
              {solution.violations.map((error, i) =>
                <ListItem key={i}>
                  <Avatar className={classes.error}>
                    <Error />
                  </Avatar>
                  <ListItemText primary={error} />
                </ListItem>
              )}
            </List>
          </Popover>
        </React.Fragment>
        }
        <IconButton onClick={() => orientation === 'left' ? store.leftSelectedSolution = null : store.rightSelectedSolution = null}><Close /></IconButton>
      </Toolbar>
      <div className={classNames(classes.main, {[classes.right]: orientation === 'right'})}>
        <MareyChart solution={solution} />
        <SolutionMap solution={solution} />
      </div>
      <SolutionStats solution={solution} orientation={orientation} />
    </div>;
  }
}

export default withStyles(styles)(Solution);
