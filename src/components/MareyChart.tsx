import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {ISolution, ITruckRoute, isDepot} from '../model/interfaces';
import {Typography} from '@material-ui/core';
import {scaleLinear} from 'd3';

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
    display: 'flex',
  },
  timeline: {
    flex: '1 1 0',
    position: 'relative',

    '&::before': {
      content: ' ',
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: '1px',
      borderBottom: '2px solid black'
    }
  },
  window: {
    position: 'absolute',
    borderRadius: 5,
    background: 'lightgray',
    transition: 'all 0.5s ease',
    top: '10%',
    bottom: '10%'
  },
  effective: {
    position: 'absolute',
    borderRadius: 5,
    transition: 'all 0.5s ease',
    top: '15%',
    bottom: '15%',
    opacity: 0.5
  },
  service: {
    position: 'absolute',
    transition: 'all 0.5s ease',
    borderRadius: 5,
    top: '25%',
    bottom: '25%'
  },
  label: {
    fontSize: 'small'
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
    const store = this.props.store!;
    const scale = scaleLinear().domain([0, store.maxFinishTime]).range([0, 100]).clamp(true);

    return <div className={classes.truck}>
      <Typography>{truck.truck.name} ({truck.totalDistance} km, {truck.usedCapacity}/{truck.truck.capacity})</Typography>
      {truck.route.map((route, i) => {
        const startWindow = scale(route.customer.startTime);
        const widthWindow = scale(route.customer.endTime) - startWindow;
        const startArrive = scale(route.arrivalTime);
        const widthArrive = scale(route.departureTime) - startArrive;
        const startService = scale(route.startOfService);
        const widthService = scale(route.endOfService) - startService;

        const details = <React.Fragment>
          <div style={{left: `${startWindow}%`, width: `${widthWindow}%`}} className={classes.window}/>
          <div style={{left: `${startArrive}%`, width: `${widthArrive}%`, background: truck.truck.color}} className={classes.effective} />
          <div style={{left: `${startService}%`, width: `${widthService}%`, background: truck.truck.color}} className={classes.service} />
        </React.Fragment>;
        return <div key={i === 0 ? -1 : route.customer.id} className={classes.customer}>
          <Typography className={classes.label}>{route.customer.name}</Typography>
          <div className={classes.timeline}>
            {!isDepot(route.customer) ? details : null}
          </div>
        </div>;
      })}
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
