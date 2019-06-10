import React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {ITruckRoute, isDepot} from '../model/interfaces';
import {Typography, Badge, Tooltip, Toolbar, IconButton} from '@material-ui/core';
import {scaleLinear, scaleBand, line, scaleTime, timeMinute} from 'd3';
import ContainerDimensions from 'react-container-dimensions';
import classNames from 'classnames';
import SolutionNode from '../model/SolutionNode';
import {toDistance} from '../utils';
import Home from '@material-ui/icons/Home';
import Lock from '@material-ui/icons/Lock';
import LockOpen from '@material-ui/icons/LockOpen';

const styles = (_theme: Theme) => createStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  truck: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 0',
  },
  locked: {
    // TODO,
    '& > $route': {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    '& > $route *': {
      pointerEvents: ['none', '!important'] as any, // no supported by typings but by JSS
    }
  },
  route: {
    flex: '1 1 0',
    position: 'relative'
  },
  customer: {
    position: 'absolute',
    display: 'flex',
    width: '100%',
    alignItems: 'center'
  },
  truckRoute: {
    pointerEvents: 'none',
    position: 'absolute'
  },
  effective: {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
    strokeOpacity: 0.5,
    strokeWidth: 8
  },

  timeline: {
    flex: '1 1 0',
    background: 'black',
    height: 1
  },
  label: {
    cursor: 'pointer',
    textAlign: 'center',
    width: 25
  },
  window: {
    position: 'absolute',
    background: 'lightgray',
    borderRadius: 5,
    height: 10
  },
  service: {
    position: 'absolute',
    borderRadius: 5,
    height: 8
  },


  selected: {
    strokeOpacity: 1,
    strokeWidth: 10
  },
  selectedC: {
    '& $label': {
      fontWeight: 'bold',
    },
    '& > $timeline': {
      height: 3
    }
  },

  timelineaxis: {
    height: 20,

    '& > svg': {
      position: 'absolute'
    },
    '& line': {
      stroke: 'black',
      strokeWidth: 2
    },
    '& text': {
      textAnchor: 'middle',
      dominantBaseline: 'hanging'
    }
  }
});



export interface IMareyChartProps extends WithStyles<typeof styles>, IWithStore {
  solution: SolutionNode;
}

interface IMareyTruckProps extends WithStyles<typeof styles>, IWithStore {
  solution: SolutionNode;
  truck: ITruckRoute;
}

interface IMareyTruckRouteProps extends IMareyTruckProps {
  width: number;
  height: number;
}

@inject('store')
@observer
class MareyTruckRoute extends React.Component<IMareyTruckRouteProps> {
  render() {
    const {truck, classes, solution, width, height} = this.props;
    const store = this.props.store!;
    const xscale = scaleLinear().domain([0, store.maxFinishTime]).range([25, width - 5]).clamp(true);
    const yscale = scaleBand().domain(truck.route.map((_, i) => i.toString())).range([0, height]).padding(0.1);
    const center = yscale.bandwidth() / 2;

    const genPath = () => {
      const points: [number, number][] = [];
      truck.route.forEach((route, i) => {

        const y = center + yscale(i.toString())!;
        if (i > 0) {
          points.push([route.arrivalTime, y]);
        }
        if (i < truck.route.length - 1) {
          points.push([route.departureTime, y]);
        }
      });
      return line<[number, number]>().x((v) => xscale(v[0]))(points);
    };

    return <React.Fragment>
      {truck.route.map((route, i) => {
        if (isDepot(route.customer)) {
          return <div key={i === 0 ? -1 : route.customer.id}
            className={classNames(classes.customer, {[classes.selectedC]: store.hoveredTruck === truck.truck && store.hoveredSolution === solution && store.hoveredCustomer == route.customer})}
            onMouseOver={() => store.hoveredCustomer = route.customer} onMouseOut={() => store.hoveredCustomer = null}
            style={{transform: `translate(0, ${yscale(i.toString())}px)`}}>
            <Typography className={classes.label}><Home /></Typography>
            <div className={classes.timeline}></div>
          </div>;
        }
        const windowStart = xscale(route.customer.startTime);
        const windowEnd = xscale(route.customer.endTime);
        const serviceStart = xscale(route.startOfService);
        const serviceEnd = xscale(route.endOfService);

        const isLocked = solution.isCustomerLocked(truck.truck, route.customer);

        return <div key={route.customer.id}
          className={classNames(classes.customer, {[classes.selectedC]: store.hoveredTruck === truck.truck && store.hoveredSolution === solution && store.hoveredCustomer == route.customer})}
          onMouseOver={() => store.hoveredCustomer = route.customer} onMouseOut={() => store.hoveredCustomer = null}
          style={{transform: `translate(0, ${yscale(i.toString())}px)`}}>
          <Tooltip title={isLocked ? `Customer ${route.customer.name} has to be served by ${truck.truck.name} - Click to unlock` : `Click to force customer ${route.customer.name} to be served by ${truck.truck.name}`}>
            <Badge badgeContent={<Lock fontSize="small" onClick={() => store.toggleCustomerLocked(solution, truck.truck, route.customer)} />} invisible={!isLocked}>
              <Typography className={classes.label} onClick={() => store.toggleCustomerLocked(solution, truck.truck, route.customer)}>{route.customer.name}</Typography>
            </Badge>
          </Tooltip>
          <div className={classes.timeline}></div>
          <div className={classes.window} style={{transform: `translate(${windowStart}px,0)`, width: `${windowEnd - windowStart}px`}} />
          <div className={classes.service} style={{transform: `translate(${serviceStart}px,0)`, width: `${serviceEnd - serviceStart}px`, background: truck.truck.color}}/>
        </div>;
      })}
      <svg width={width} height={height} className={classes.truckRoute}>
        <path d={genPath()!} className={classNames(classes.effective, {[classes.selected]: store.hoveredTruck === truck.truck && store.hoveredSolution === solution && store.hoveredCustomer == null})} style={{stroke: truck.truck.color}}/>
      </svg>
    </React.Fragment>;
  }
}

@inject('store')
@observer
class MareyTruck extends React.Component<IMareyTruckProps> {

  render() {
    const {truck, classes, solution} = this.props;
    const store = this.props.store!;
    const isLocked = solution.isTruckLocked(truck);
    return <div className={classNames(classes.truck, {[classes.locked]: isLocked})} style={{flexGrow: truck.route.length}} onMouseEnter={() => store.hoveredTruck = truck.truck} onMouseLeave={() => store.hoveredTruck = null}>
      <Toolbar disableGutters variant="dense">
        <Typography>{truck.truck.name} ({toDistance(truck.totalDistance)}, {truck.usedCapacity}/{truck.truck.capacity})</Typography>
        <IconButton onClick={() => store.toggleTruckLocked(solution, truck)} title={isLocked ? `The route of ${truck.truck.name} is locked - Click to unlock` : `Click to lock the route of truck ${truck.truck.name}`}>
          {isLocked ? <Lock /> : <LockOpen />}
        </IconButton>
      </Toolbar>
      <div className={classes.route}>
      <ContainerDimensions>{(args) => <MareyTruckRoute {...args} {...this.props} />}</ContainerDimensions>
      </div>
    </div>;
  }
}

@inject('store')
@observer
class TimelineAxis extends React.Component<WithStyles<typeof styles> & IWithStore & {width: number, height: number}> {

  render() {
    const {width, height} = this.props;
    const store = this.props.store!;
    const base = new Date(2018, 1, 1, 8, 0, 0, 0);
    const xscale = scaleTime().domain([base, timeMinute.offset(base, store.maxFinishTime)]).range([25, width - 5]).clamp(true);
    const format = xscale.tickFormat(8);

    return <svg width={width} height={height}>
      <line x1={xscale.range()[0]} x2={xscale.range()[1]} />
      {xscale.ticks(8).map((t) => <g key={t.toString()} transform={`translate(${xscale(t)}, 0)`} >
          <line y2={3} />
          <text y={5} >{format(t)}</text>
      </g>)}
    </svg>;
  }
}

@inject('store')
@observer
class MareyChart extends React.Component<IMareyChartProps> {
  render() {
    const {solution, classes} = this.props;
    // const store = this.props.store!;

    return <div className={classes.root}>
      {solution.trucks.map((truck) => <MareyTruck key={truck.truck.id} truck={truck} classes={classes} solution={solution} />)}
      <div className={classNames(classes.timelineaxis)}>
        <ContainerDimensions>{(args) => <TimelineAxis classes={classes} {...args}/>}</ContainerDimensions>
      </div>
    </div>;
  }
}

export default withStyles(styles)(MareyChart);
