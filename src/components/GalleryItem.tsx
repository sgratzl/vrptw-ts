import React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {Typography, Toolbar, IconButton, Badge} from '@material-ui/core';
import SolutionRoute from './SolutionRoute';
import {scaleLinear} from 'd3-scale';
import classNames from 'classnames';
import SolutionNode from '../model/SolutionNode';
import SolutionStats from './SolutionStats';
import {toDistance} from '../utils';
import SolutionState from './SolutionState';
import Bookmark from '@material-ui/icons/Bookmark';
import CenterFocusStrong from '@material-ui/icons/CenterFocusStrong';
import CenterFocusWeak from '@material-ui/icons/CenterFocusWeak';

const styles = (_theme: Theme) => createStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid lightgray',
    borderRadius: 5
  },
  header: {
    display: 'flex',
  },
  spacer: {
    flex: '1 1 0'
  },
  selected: {
    boxShadow: '0 0 5px 3px orange'
  }
});



export interface IGalleryItemProps extends WithStyles<typeof styles>, IWithStore {
  solution: SolutionNode;
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

    const isLeft = store.leftSelectedSolution === solution;
    const isRight = store.rightSelectedSolution === solution;

    return <div className={classNames(classes.root, {[classes.selected]: store.hoveredSolution === solution})}
      onMouseEnter={() => store.hoveredSolution = solution}
      onMouseLeave={() => store.hoveredSolution = null}
    >
      <Toolbar disableGutters variant="dense" className={classes.header}>
        <Typography variant="caption">{solution.name} ({toDistance(solution.distance)})</Typography>
        <div className={classes.spacer} />
        <SolutionState solution={solution} />
        <IconButton onClick={() => store.leftSelectedSolution = isLeft ? null : solution} title="Show in the left focus">
          <Badge badgeContent="L" color={isLeft ? 'primary' : 'default'}>
            {isLeft ? <CenterFocusStrong /> : <CenterFocusWeak />}
          </Badge>
        </IconButton>
          <IconButton onClick={() => store.rightSelectedSolution = isRight ? null : solution} title="Show in the left focus">
            <Badge badgeContent="R" color={isRight ? 'secondary' : 'default'}>
              {isRight ? <CenterFocusStrong /> : <CenterFocusWeak />}
            </Badge>
          </IconButton>
        <IconButton onClick={() => store.toggleInGallery(solution)}><Bookmark/></IconButton>

      </Toolbar>
      <SolutionRoute solution={solution} width={200} height={200} lat2y={lat2y} lng2x={lng2x} />
      <SolutionStats solution={solution}/>
    </div>;
  }
}

export default withStyles(styles)(GalleryItem);
