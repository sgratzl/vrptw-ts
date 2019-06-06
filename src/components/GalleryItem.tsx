import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {ISolution} from '../model/interfaces';
import {Typography} from '@material-ui/core';
import SolutionRoute from './SolutionRoute';
import {scaleLinear} from 'd3-scale';
import classNames from 'classnames';

const styles = (_theme: Theme) => createStyles({
  root: {
    display: 'flex',
    flexDirection: 'column'
  },
  selected: {
    boxShadow: '0 0 5px 3px orange'
  }
});



export interface IGalleryItemProps extends WithStyles<typeof styles>, IWithStore {
  solution: ISolution;
}

// from Leaflet map.getBounds()
const VISIBLE_BOUNDS = {
  _southWest: {
    lat: -37.95502661288625,
    lng: 145.0566101074219
  },
  _northEast: {
    lat: -37.8699751770108,
    lng: 145.2159118652344
  }
};


@inject('store')
@observer
class GalleryItem extends React.Component<IGalleryItemProps> {
  render() {
    const classes = this.props.classes;
    const store = this.props.store!;
    const solution = this.props.solution;


    const lat2y = scaleLinear().domain([VISIBLE_BOUNDS._southWest.lat, VISIBLE_BOUNDS._northEast.lat]).range([200, 0]);
    const lng2x = scaleLinear().domain([VISIBLE_BOUNDS._southWest.lng, VISIBLE_BOUNDS._northEast.lng]).range([0, 200]);

    return <div className={classNames(classes.root, {[classes.selected]: store.hoveredSolution === solution})}
      onMouseEnter={() => store.hoveredSolution = solution}
      onMouseLeave={() => store.hoveredSolution = null}
      >
      <SolutionRoute solution={solution} width={200} height={200} lat2y={lat2y} lng2x={lng2x}/>
      <Typography variant="caption" align="center">{solution.name}</Typography>
    </div>;
  }
}

export default withStyles(styles)(GalleryItem);
