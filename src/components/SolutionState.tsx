import React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import SolutionNode, {ESolutionNodeState} from '../model/SolutionNode';
import {CircularProgress, IconButton, Badge, Tooltip} from '@material-ui/core';
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

    switch (solution.state) {
      case ESolutionNodeState.INTERACTIVE:
        return <Tooltip title="Solve this solution with the current constraints">
          <IconButton onClick={this.onSolve}>
            <Badge badgeContent={solution.countCustomConstraints} color="primary" title={`${solution.countCustomConstraints} number of extra constraints`}>
              <Memory />
            </Badge>
          </IconButton>
        </Tooltip>;
      case ESolutionNodeState.SOLVING:
        return <CircularProgress />;
      case ESolutionNodeState.TIMEDOUT:
        return <Tooltip title="The solution cannot be solved with the time frame - Click to try again">
          <IconButton onClick={this.onSolve}>
            <Timelapse />
          </IconButton>
        </Tooltip>;
      case ESolutionNodeState.UNSATISFIABLE:
        return <Tooltip title="The solution cannot be solved with the given constraints">
          <IconButton disabled >
            <Badge badgeContent={solution.countCustomConstraints} color="error" title={`${solution.countCustomConstraints} number of extra constraints`}>
              <Warning color="error" />
            </Badge>
          </IconButton>
        </Tooltip>;
    }

    return <div className={classes.root}>
    </div>;
  }
}

export default withStyles(styles)(SolutionState);
