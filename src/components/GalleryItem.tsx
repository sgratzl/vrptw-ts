import React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {Typography, Toolbar, IconButton, Badge, Tooltip} from '@material-ui/core';
import SolutionRoute from './SolutionRoute';
import {scaleLinear} from 'd3-scale';
import classNames from 'classnames';
import SolutionNode from '../model/SolutionNode';
import SolutionStats from './SolutionStats';
import {toDistance} from '../utils';
import SolutionState from './SolutionState';
import Close from '@material-ui/icons/Close';
import Bookmark from '@material-ui/icons/Bookmark';
import BookmarkBorder from '@material-ui/icons/BookmarkBorder';
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
  asPreview?: boolean;
}

// from Leaflet map.getBounds()
const VISIBLE_BOUNDS = {
  _southWest: {
    lat: -37.9428437495074,
    lng: 145.09334564208987
  },
  _northEast: {
    lat: -37.88217011264733,
    lng: 145.17917633056643
  }
};

// from Leaflet map.getContainer().getBoundingClientRect()
const VISIBLE_PIXEL_BOUNDS = {
  height: 224,
  width: 250
};


@inject('store')
@observer
class GalleryItem extends React.Component<IGalleryItemProps> {
  render() {
    const {classes, solution, asPreview} = this.props;
    const store = this.props.store!;


    const lat2y = scaleLinear().domain([VISIBLE_BOUNDS._southWest.lat, VISIBLE_BOUNDS._northEast.lat]).range([VISIBLE_PIXEL_BOUNDS.height, 0]);
    const lng2x = scaleLinear().domain([VISIBLE_BOUNDS._southWest.lng, VISIBLE_BOUNDS._northEast.lng]).range([0, VISIBLE_PIXEL_BOUNDS.width]);

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
        <Tooltip title={isLeft ? `Remove solution from left focus` : `Show solution in the left focus`}>
          <IconButton onClick={() => store.leftSelectedSolution = isLeft ? null : solution}>
          <Badge badgeContent="L" color={isLeft ? 'primary' : 'default'}>
            {isLeft ? <CenterFocusStrong /> : <CenterFocusWeak />}
          </Badge>
        </IconButton>
        </Tooltip>
        <Tooltip title={isRight ? `Remove solution from right focus` : `Show solution in the right focus`}>
          <IconButton onClick={() => store.rightSelectedSolution = isRight ? null : solution} >
            <Badge badgeContent="R" color={isRight ? 'secondary' : 'default'}>
              {isRight ? <CenterFocusStrong /> : <CenterFocusWeak />}
            </Badge>
        </IconButton>
        </Tooltip>
        {asPreview ? <React.Fragment>
          <Tooltip title={store.isInGallery(solution) ? `Remove solution from gallery` : `Add solution to gallery`}>
            <IconButton onClick={() => store.toggleInGallery(solution)}>{store.isInGallery(solution) ? <Bookmark/> : <BookmarkBorder/>}</IconButton>
          </Tooltip>
          <IconButton onClick={() => store.ui.visibleHistoryAnchor = null}><Close/></IconButton>
        </React.Fragment> :
          <IconButton onClick={() => store.toggleInGallery(solution)}><Close/></IconButton>
        }

      </Toolbar>
      <SolutionRoute solution={solution} width={250} height={224} lat2y={lat2y} lng2x={lng2x} />
      <SolutionStats solution={solution}/>
    </div>;
  }
}

export default withStyles(styles)(GalleryItem);
