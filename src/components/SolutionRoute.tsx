import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {ISolution, ITruckRoute, ILatLng} from '../model/interfaces';
import {line} from 'd3-shape';

const styles = (_theme: Theme) => createStyles({
  root: {

  },
  customer: {
    '& path': {
      strokeOpacity: 0.5
    },
    '& text': {
      textAnchor: 'middle'
    }
  }
});



export interface ISolutionRouteProps extends WithStyles<typeof styles>, IWithStore {
  solution: ISolution;
  width: number;
  height: number;
  lat2x(lat: number): number;
  lng2y(lng: number): number;
}

export interface ISolutionTruckRouteProps extends WithStyles<typeof styles>, IWithStore {
  truck: ITruckRoute;
  lat2x(lat: number): number;
  lng2y(lng: number): number;
}


class SolutionTruckRoute extends React.Component<ISolutionTruckRouteProps> {
  render() {
    const {truck, lat2x, lng2y, classes} = this.props;
    // const store = this.props.store!;

    const lineGen = line<ILatLng>()
      .x((v) => lat2x(v.lat))
      .y((v) => lng2y(v.lng));

    return <g>
      {truck.route.map((r, i) => <g key={`${r.customer.id}${i}`} className={classes.customer}>
        <path d={lineGen(r.wayPointsTo)!} style={{stroke: truck.truck.color}} />
        <circle cx={lat2x(r.customer.lat)} cy={lng2y(r.customer.lng)} style={{fill: truck.truck.color}} r="5">
          <title>{r.customer.name}</title>
        </circle>
        <text x={lat2x(r.customer.lat)} y={lng2y(r.customer.lng)} >{r.customer.name}</text>
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
