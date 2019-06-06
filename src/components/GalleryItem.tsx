import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {ISolution} from '../model/interfaces';
import {Typography} from '@material-ui/core';
import SolutionRoute from './SolutionRoute';

const styles = (_theme: Theme) => createStyles({
  root: {

  }
});



export interface IGalleryItemProps extends WithStyles<typeof styles>, IWithStore {
  solution: ISolution;
}


@inject('store')
@observer
class GalleryItem extends React.Component<IGalleryItemProps> {
  render() {
    const classes = this.props.classes;
    // const store = this.props.store!;
    const solution = this.props.solution;

    const lat2x = (lat: number) => lat / 100;
    const lng2y = (lng: number) => lng / 100;

    return <div className={classes.root}>
      <SolutionRoute solution={solution} width={200} height={200} lat2x={lat2x} lng2y={lng2y}/>
      <Typography variant="caption">{solution.name}</Typography>
    </div>;
  }
}

export default withStyles(styles)(GalleryItem);
