import React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {ITruckRoute, ILatLng, isDepot} from '../model/interfaces';
import {line} from 'd3-shape';
import classNames from 'classnames';
import SolutionNode from '../model/SolutionNode';

const styles = (_theme: Theme) => createStyles({
  root: {
    '& path': {
      strokeOpacity: 0.5,
      strokeWidth: 3,
      fill: 'none'
    },
  },
  customer: {
    '& text': {
      fontFamily: _theme.typography.fontFamily,
      fontSize: '80%',
      textAnchor: 'middle',
      dominantBaseline: 'central'
    },
    '& circle': {
      transition: 'all 0.25s ease'
    }
  },
  depot: {
    '& circle': {
      fill: 'black',
      strokeWidth: 2
    },
    '& path': {
      fill: 'white'
    },

  },
  selected: {
    '& > path': {
      strokeOpacity: 1,
      strokeWidth: 4,
    }
  },
  selectedC: {
    '& circle': {
      transform: 'scale(1.5)'
    }
  }
});



export interface ISolutionRouteProps extends WithStyles<typeof styles>, IWithStore {
  solution: SolutionNode;
  width: number;
  height: number;
  lat2y(lat: number): number;
  lng2x(lng: number): number;
}

export interface ISolutionTruckRouteProps extends WithStyles<typeof styles>, IWithStore {
  truck: ITruckRoute;
  solution: SolutionNode;
  lat2y(lat: number): number;
  lng2x(lng: number): number;
}

@observer
class SolutionTruckRoute extends React.Component<ISolutionTruckRouteProps> {

  private genRoute(route: ILatLng[]) {
    const {lat2y, lng2x} = this.props;

    const p: [number, number][] = [];
    let last: [number, number] | undefined = undefined;
    for (const r of route) {
      const v: [number, number] = [lng2x(r.lng), lat2y(r.lat)];
      if (!last || last[0] !== v[0] || last[1] !== v[1]) {
        last = v;
        p.push(v);
      }
    }

    return line()(p);
  }

  render() {
    const {truck, lat2y, lng2x, classes} = this.props;
    const store = this.props.store!;

    return <g className={classNames({[classes.selected]: store.hoveredTruck === truck.truck && store.hoveredCustomer == null})}
      onMouseEnter={() => store.hoveredTruck = truck.truck} onMouseLeave={() => store.hoveredTruck = null}>
      <path d={this.genRoute(truck.wayPoints)!} style={{stroke: truck.truck.color}} markerMid="url(#arrow)" markerEnd="url(#arrow)" />
      {truck.route.filter((d) => !isDepot(d.customer)).map((r) => <g key={r.customer.id}
        className={classNames(classes.customer, {[classes.selectedC]: store.hoveredTruck === truck.truck && store.hoveredCustomer === r.customer})}
        onMouseEnter={() => store.hoveredCustomer = r.customer} onMouseLeave={() => store.hoveredCustomer = null}
        transform={`translate(${lng2x(r.customer.lng)},${lat2y(r.customer.lat)})`}>
          <circle style={{fill: truck.truck.color}} r="10" onMouseEnter={() => store.hoveredCustomer = r.customer} onMouseLeave={() => store.hoveredCustomer = null}>
            <title>{r.customer.name}</title>
          </circle>
          <text onMouseEnter={() => store.hoveredCustomer = r.customer} onMouseLeave={() => store.hoveredCustomer = null}>{r.customer.name}</text>
      </g>)}
    </g>;
  }
}

@inject('store')
@observer
class SolutionRoute extends React.Component<ISolutionRouteProps> {
  render() {
    const {classes, width, solution, height, lng2x, lat2y} = this.props;
    const store = this.props.store!;
    const depot = solution.problem.depot;

    return <svg className={classes.root} width={width} height={height}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
          markerWidth="6" markerHeight="6"
          orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
      </defs>
      {solution.trucks.map((truck) => <SolutionTruckRoute key={truck.truck.id} truck={truck} {...this.props} />)}
      {/*depot at the end*/}
      <g
        className={classNames(classes.customer, classes.depot, {[classes.selectedC]: store.hoveredCustomer === depot})} onMouseEnter={() => store.hoveredCustomer = depot} onMouseLeave={() => store.hoveredCustomer = null}
        transform={`translate(${lng2x(depot.lng)},${lat2y(depot.lat)})`}>
        <circle style={{stroke: 'black'}} r="10" >
          <title>{depot.name}</title>
        </circle>
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" transform="translate(-11,-11)scale(0.9)" />
      </g>
    </svg>;
  }
}

export default withStyles(styles)(SolutionRoute);
