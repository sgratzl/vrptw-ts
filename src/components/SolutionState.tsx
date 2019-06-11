import React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import SolutionNode, {ESolutionNodeState} from '../model/SolutionNode';
import {CircularProgress, IconButton, Badge} from '@material-ui/core';
import Timelapse from '@material-ui/icons/Timelapse';
import Memory from '@material-ui/icons/Memory';
import Warning from '@material-ui/icons/Warning';
import {bind} from 'decko';

const styles = (_theme: Theme) => createStyles({
  root: {

  }
});



export interface ISolutionStateProps extends WithStyles<typeof styles>, IWithStore {
  solution: SolutionNode;
}


@inject('store')
@observer
class SolutionState extends React.Component<ISolutionStateProps> {
  @bind
  private onSolve() {
    const {solution} = this.props;
    const store = this.props.store!;

    store.solve(solution);
  }


  render() {
    const {classes, solution} = this.props;

    switch(solution.state) {
      case ESolutionNodeState.INTERACTIVE:
        return <IconButton onClick={this.onSolve} title="Solve this solution with the current constraints">
            <Badge badgeContent={solution.countCustomConstraints} color="primary" title={`${solution.countCustomConstraints} number of extra constraints`}>
              <Memory />
            </Badge>
          </IconButton>;
      case ESolutionNodeState.SOLVING:
        return <CircularProgress />;
      case ESolutionNodeState.TIMEDOUT:
        return <IconButton title="The solution cannot be solved with the time frame - Click to try again"  onClick={this.onSolve}>
          <Timelapse />
        </IconButton>;
      case ESolutionNodeState.UNSATISFIABLE:
        return <IconButton disabled title="The solution cannot be solved with the given constraints">
          <Badge badgeContent={solution.countCustomConstraints} color="error" title={`${solution.countCustomConstraints} number of extra constraints`}>
            <Warning color="error"/>
          </Badge>
          </IconButton>;
    }

    return <div className={classes.root}>
    </div>;
  }
}

export default withStyles(styles)(SolutionState);
