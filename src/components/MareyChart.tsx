import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {ISolution, ITruckRoute, isDepot, IServedCustomer} from '../model/interfaces';
import {Typography} from '@material-ui/core';
import {scaleLinear} from 'd3';
import Home from '@material-ui/icons/Home';

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
    width: '3em',
    textAlign: 'center',
    fontSize: '1.25rem',
    transform: 'scale(0.75,0.75)'
  },
  connector: {
    transformOrigin: 'left center',
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

    const computeLineStyle = (a: IServedCustomer, b: IServedCustomer): React.CSSProperties => {
      const leave = scale(a.departureTime);
      const arrive = scale(b.arrivalTime);

      const width = arrive - leave;
      const lineHeight = 30 / 4; // TODO

      const length = Math.sqrt(Math.pow(lineHeight, 2) + Math.pow(width, 2));

      const angle = Math.atan2(lineHeight, width);

      return {
        left: `${leave}%`,
        width: `${lineHeight}%`,
        transform: `rotate(${angle}rad)`
      };
  };

    return <div className={classes.truck}>
      <Typography>{truck.truck.name} ({truck.totalDistance} km, {truck.usedCapacity}/{truck.truck.capacity})</Typography>
      {truck.route.map((route, i) => {

        const connector = () => <div style={Object.assign(computeLineStyle(route, truck.route[i + 1]!), {background: truck.truck.color})} className={`${classes.connector} ${classes.effective}`} />;

        if (isDepot(route.customer)) {
          return <div key={i === 0 ? -1 : route.customer.id} className={classes.customer}>
            <Typography className={classes.label}><Home fontSize="small" /></Typography>
            <div className={classes.timeline}>
              {i === 0 && connector()}
            </div>
          </div>;
        }

        const startWindow = scale(route.customer.startTime);
        const widthWindow = scale(route.customer.endTime) - startWindow;
        const startArrive = scale(route.arrivalTime);
        const widthArrive = scale(route.departureTime) - startArrive;
        const startService = scale(route.startOfService);
        const widthService = scale(route.endOfService) - startService;

        return <div key={i === 0 ? -1 : route.customer.id} className={classes.customer}>
          <Typography className={classes.label}>{route.customer.name}</Typography>
          <div className={classes.timeline}>
            <div style={{left: `${startWindow}%`, width: `${widthWindow}%`}} className={classes.window}/>
            <div style={{left: `${startArrive}%`, width: `${widthArrive}%`, background: truck.truck.color}} className={classes.effective} />
            <div style={{left: `${startService}%`, width: `${widthService}%`, background: truck.truck.color}} className={classes.service} />
            {connector()}
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
