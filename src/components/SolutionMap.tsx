import React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {bind} from 'decko';
import SolutionRoute from './SolutionRoute';
import {map, tileLayer, Map} from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ContainerDimensions from 'react-container-dimensions';
import SolutionNode from '../model/SolutionNode';

const styles = (_theme: Theme) => createStyles({
  root: {
    minHeight: '14rem',
    position: 'relative',
    '& > *': {
      position: 'absolute',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000
    }
  }
});



export interface ISolutionMapProps extends WithStyles<typeof styles>, IWithStore {
  solution: SolutionNode;
}

interface ISolutionMapImplState {
  lat2y(v: number): number;
  lng2x(v: number): number;
}

class SolutionMapImpl extends React.Component<ISolutionMapProps, ISolutionMapImplState> {
  private map: Map | null = null;

  constructor(props: ISolutionMapProps) {
    super(props);

    this.state = {
      lat2y: (v) => v,
      lng2x: (v) => v
    };
  }

  @bind
  private assignRef(elem: HTMLElement | null) {
    if (!elem || this.map) {
      return;
    }

    const layer = tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', Object.assign({
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://mapbox.com">Mapbox</a>',
    }, {
        id: 'mapbox.streets'
      }));

    this.map = map(elem, {
      doubleClickZoom: false,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      center: [-37.912524, 145.136218],
      zoom: 12,
    });
    this.map.addLayer(layer);
    this.setState({
      lat2y: (v) => {
        return this.map ? this.map.latLngToLayerPoint([v, 0]).y : v;
      },
      lng2x: (v) => {
        return this.map ? this.map.latLngToLayerPoint([0, v]).x : v;
      }
    });
  }

  componentWillUnmount() {
    this.map = null;
  }

  render() {
    const {classes, solution} = this.props;
    // const store = this.props.store!;

    return <div className={classes.root}>
      <div className={classes.root} ref={this.assignRef}>
      </div>
      <ContainerDimensions>
        {(args) => <SolutionRoute solution={solution} {...this.state} {...args} />}
      </ContainerDimensions>
    </div>;
  }
}


@inject('store')
@observer
class SolutionMap extends React.Component<ISolutionMapProps> {
  render() {
    return <SolutionMapImpl {...this.props} />;
  }
}

export default withStyles(styles)(SolutionMap);
