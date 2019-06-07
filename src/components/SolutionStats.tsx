import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {scaleLinear} from 'd3';
import {Typography} from '@material-ui/core';
import classNames from 'classnames';
import SolutionNode from '../model/SolutionNode';

const styles = (_theme: Theme) => createStyles({
  root: {
  },
  bar: {
    position: 'relative',
    height: '1rem',
    display: 'flex',
    justifyContent: 'flex-end',

    '& > div': {
      position: 'relative',
      transition: 'all 0.25s ease'
    }
  },
  notSelected: {
    opacity: 0.5
  },
  right: {
    flexDirection: 'row-reverse'
  }
});



export interface ISolutionStatsProps extends WithStyles<typeof styles>, IWithStore {
  solution: SolutionNode;
  orientation: 'left' | 'right';
}


@inject('store')
@observer
class SolutionStats extends React.Component<ISolutionStatsProps> {
  render() {
    const {classes, solution, orientation} = this.props;
    const store = this.props.store!;
    const scale = scaleLinear().domain([0, store.maxDistance]).range([0, 100]);

    return <Typography className={classes.root} component="div">
      <div className={classNames(classes.bar, {[classes.right]: orientation === 'right'})}>
        {solution.trucks.map((truck) => <div key={truck.truck.id}
          style={{backgroundColor: truck.truck.color, width: `${scale(truck.totalDistance)}%`}}
          onMouseEnter={() => store.hoveredTruck = truck.truck} onMouseLeave={() => store.hoveredTruck = null}
          className={store.hoveredSolution === solution && store.hoveredTruck && store.hoveredTruck !== truck.truck ? classes.notSelected : undefined}
        />)}
      </div>
    </Typography>;
  }
}

export default withStyles(styles)(SolutionStats);
