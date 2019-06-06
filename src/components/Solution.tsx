import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {ISolution} from '../model/interfaces';
import {Typography} from '@material-ui/core';
import MareyChart from './MareyChart';
import SolutionMap from './SolutionMap';
import classNames from 'classnames';

const styles = (_theme: Theme) => createStyles({
  root: {
    display: 'flex',
    flexDirection: 'column'
  },
  main: {
    flex: '1 1 0',
    display: 'flex',

    '& > *': {
      flex: '1 1 0'
    }
  },
  selected: {
    boxShadow: '0 0 5px 3px orange'
  }
});



export interface ISolutionProps extends WithStyles<typeof styles>, IWithStore {
  className?: string;
  solution: ISolution | null;
  orientation: 'left' | 'right';
}


@inject('store')
@observer
class Solution extends React.Component<ISolutionProps> {
  render() {
    const classes = this.props.classes;
    const store = this.props.store!;
    const solution = this.props.solution;

    if (!solution) {
      return <div className={classNames(classes.root, this.props.className)}>
        <Typography variant="h6">No Solution Selected</Typography>
      </div>;
    }

    return <div className={classNames(classes.root, this.props.className, {[classes.selected]: store.hoveredSolution === solution})}
            onMouseEnter={() => store.hoveredSolution = solution}
            onMouseLeave={() => store.hoveredSolution = null}>
      <Typography variant="h6">{solution.name}</Typography>
      <div className={classes.main}>
        <MareyChart solution={solution} />
        <SolutionMap solution={solution} />
      </div>
    </div>;
  }
}

export default withStyles(styles)(Solution);
