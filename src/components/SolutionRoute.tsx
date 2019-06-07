import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {ISolution, ITruckRoute, ILatLng} from '../model/interfaces';
import {line} from 'd3-shape';
import classNames from 'classnames';

const styles = (_theme: Theme) => createStyles({
  root: {

  },
  customer: {
    '& path': {
      strokeOpacity: 0.5,
      strokeWidth: 3,
      fill: 'none'
    },
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
  selected: {
    '& path': {
      strokeOpacity: 1,
      strokeWidth: 4
    },
    '& circle': {
      transform: 'scale(1.5)'
    }
  },
  selectedC: {
    '& circle': {
      transform: 'scale(1.5)'
    }
  }
});



export interface ISolutionRouteProps extends WithStyles<typeof styles>, IWithStore {
  solution: ISolution;
  width: number;
  height: number;
  lat2y(lat: number): number;
  lng2x(lng: number): number;
}

export interface ISolutionTruckRouteProps extends WithStyles<typeof styles>, IWithStore {
  truck: ITruckRoute;
  solution: ISolution;
  lat2y(lat: number): number;
  lng2x(lng: number): number;
}

@observer
class SolutionTruckRoute extends React.Component<ISolutionTruckRouteProps> {
  render() {
    const {truck, lat2y, lng2x, classes, solution} = this.props;
    const store = this.props.store!;

    const lineGen = line<ILatLng>()
      .x((v) => lng2x(v.lng))
      .y((v) => lat2y(v.lat));

    return <g className={classNames({[classes.selected]: store.hoveredTruck === truck.truck && store.hoveredSolution === solution && store.hoveredCustomer == null})}>
      {truck.route.map((r, i) => <g key={`${r.customer.id}${i}`} className={classNames(classes.customer, {[classes.selectedC]: store.hoveredTruck === truck.truck && store.hoveredSolution === solution && store.hoveredCustomer === r.customer})} onMouseEnter={() => store.hoveredCustomer = r.customer} onMouseLeave={() => store.hoveredCustomer = null}>
        <path d={lineGen(r.wayPointsTo)!} style={{stroke: truck.truck.color}} />
        <g transform={`translate(${lng2x(r.customer.lng)},${lat2y(r.customer.lat)})`}>
          <circle style={{fill: truck.truck.color}} r="5" onMouseEnter={() => store.hoveredTruck = truck.truck} onMouseLeave={() => store.hoveredTruck = null}>
            <title>{r.customer.name}</title>
          </circle>
          <text onMouseEnter={() => store.hoveredTruck = truck.truck} onMouseLeave={() => store.hoveredTruck = null}>{r.customer.name}</text>
        </g>
      </g>)}
    </g>;
  }
}

@inject('store')
@observer
class SolutionRoute extends React.Component<ISolutionRouteProps> {
  render() {
    const {classes, width, solution, height} = this.props;
    // const store = this.props.store!;

    return <svg className={classes.root} width={width} height={height}>
      {solution.trucks.map((truck) => <SolutionTruckRoute key={truck.truck.id} truck={truck} {...this.props} />)}
    </svg>;
  }
}

export default withStyles(styles)(SolutionRoute);
