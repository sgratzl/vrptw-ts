import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {ISolution} from '../model/interfaces';
import {Typography} from '@material-ui/core';
import MareyChart from './MareyChart';
import SolutionMap from './SolutionMap';
import classNames from 'classnames';
import SolutionStats from './SolutionStats';

const styles = (_theme: Theme) => createStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0.5rem',
    padding: '0.5rem'
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
  solution: ISolution | null;
  orientation: 'left' | 'right';
}


@inject('store')
@observer
class Solution extends React.Component<ISolutionProps> {
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
      <Typography variant="h6">{solution.name}</Typography>
      <div className={classNames(classes.main, {[classes.right]: orientation === 'right'})}>
        <MareyChart solution={solution} />
        <SolutionMap solution={solution} />
      </div>
      <SolutionStats solution={solution} orientation={orientation} />
    </div>;
  }
}

export default withStyles(styles)(Solution);
