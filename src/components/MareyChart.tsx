import React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {ITruckRoute, isDepot} from '../model/interfaces';
import {Typography} from '@material-ui/core';
import {scaleLinear, scaleBand, line} from 'd3';
import ContainerDimensions from 'react-container-dimensions';
import classNames from 'classnames';
import SolutionNode from '../model/SolutionNode';

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
  route: {
    flex: '1 1 0',
    position: 'relative',
    '& path,line': {
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
    '& svg': {
      position: 'absolute'
    },
    '& text': {
      dominantBaseline: 'hanging'
    }
  },
  customer: {
    pointerEvents: 'all'
  },
  window: {
    stroke: 'lightgray',
    strokeWidth: 10
  },
  service: {
    strokeWidth: 8
  },
  effective: {
    fill: 'none',
    strokeOpacity: 0.5,
    strokeWidth: 8
  },
  selected: {
    strokeOpacity: 1,
    strokeWidth: 10
  },
  timeline: {
    stroke: 'black',
    strokeWidth: 1
  },
  selectedC: {
    strokeWidth: 2
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

    return <svg width={width} height={height}>
      {truck.route.map((route, i) => {
        const depot = isDepot(route.customer);
        return <g key={i === 0 ? -1 : route.customer.id}
          className={classes.customer} onMouseOver={() => store.hoveredCustomer === route.customer} onMouseOut={() => store.hoveredCustomer = null}
          transform={`translate(0, ${yscale(i.toString())})`}>
          {depot ? <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" transform="translate(-2,0)scale(0.6)" /> : <text>{route.customer.name}</text>}
          <line className={classNames(classes.timeline, {[classes.selectedC]: store.hoveredTruck === truck.truck && store.hoveredSolution === solution && store.hoveredCustomer === route.customer})} x1={xscale(0)} y1={center} x2={xscale(store.maxFinishTime)} y2={center} />
          {!depot && <line className={classes.window} x1={xscale(route.customer.startTime)} y1={center} x2={xscale(route.customer.endTime)} y2={center} />}
          {!depot && <line className={classes.service} x1={xscale(route.startOfService)} y1={center} x2={xscale(route.endOfService)} y2={center} style={{stroke: truck.truck.color}}/>}
        </g>;
      })}
      <path d={genPath()!} className={classNames(classes.effective, {[classes.selected]: store.hoveredTruck === truck.truck && store.hoveredSolution === solution && store.hoveredCustomer == null})} style={{stroke: truck.truck.color}}/>
    </svg>;
  }
}

@inject('store')
@observer
class MareyTruck extends React.Component<IMareyTruckProps> {

  render() {
    const {truck, classes} = this.props;
    const store = this.props.store!;
    return <div className={classNames(classes.truck)} style={{flexGrow: truck.route.length}} onMouseEnter={() => store.hoveredTruck = truck.truck} onMouseLeave={() => store.hoveredTruck = null}>
      <Typography>{truck.truck.name} ({Math.round(truck.totalDistance / 100) / 10 } km, {truck.usedCapacity}/{truck.truck.capacity})</Typography>
      <div className={classes.route}>
      <ContainerDimensions>{(args) => <MareyTruckRoute {...args} {...this.props} />}</ContainerDimensions>
      </div>
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
      {solution.trucks.map((truck) => <MareyTruck key={truck.truck.id} truck={truck} classes={classes} solution={solution}/>)}
    </div>;
  }
}

export default withStyles(styles)(MareyChart);
