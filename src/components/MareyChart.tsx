import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {ISolution, ITruckRoute} from '../model/interfaces';
import {Typography} from '@material-ui/core';
import {toJS} from 'mobx';

const styles = (_theme: Theme) => createStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  truck: {
    display: 'flex',
    flexDirection: 'column',
  },
  customer: {
    position: 'relative',

    '&::before': {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: '1px',
      borderBottom: '2px solid black'
    }
  }
});



export interface IMareyChartProps extends WithStyles<typeof styles>, IWithStore {
  solution: ISolution;
}

interface IMareyTruckProps extends WithStyles<typeof styles>, IWithStore {
  truck: ITruckRoute;
}

@inject('store')
@observer
class MareyTruck extends React.Component<IMareyTruckProps> {
  render() {
    const {truck, classes} = this.props;
    console.log(toJS(truck));
    return <div className={classes.truck}>
      <Typography>{truck.truck.name} ({truck.totalDistance} km, {truck.usedCapacity}/{truck.truck.capacity})</Typography>
      {truck.route.map((route, i) => <div key={i === 0 ? -1 : route.customer.id} className={classes.customer}>
        <Typography>{route.customer.name}</Typography>
      </div>)}
    </div>;
  }
}

@inject('store')
@observer
class MareyChart extends React.Component<IMareyChartProps> {
  render() {
    const {solution, classes} = this.props;
    // const store = this.props.store!;

    return <div className={classes.root}>
      {solution.trucks.map((truck) => <MareyTruck key={truck.truck.id} truck={truck} classes={classes} />)}
    </div>;
  }
}

export default withStyles(styles)(MareyChart);
