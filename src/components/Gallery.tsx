import React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import GalleryItem from './GalleryItem';
import classNames from 'classnames';
import {Typography} from '@material-ui/core';

const styles = (_theme: Theme) => createStyles({
  root: {
    position: 'relative',
    overflow: 'auto',
    borderLeft: '1px solid lightgray',
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  wrapper: {
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column',
    margin: '1rem'
  }
});



export interface IGalleryProps extends WithStyles<typeof styles>, IWithStore {
  className?: string;
}


@inject('store')
@observer
class Gallery extends React.Component<IGalleryProps> {
  render() {
    const classes = this.props.classes;
    const store = this.props.store!;

    return <div className={classNames(classes.root, this.props.className)}>
      <Typography variant="h6">Bookmarks</Typography>
      <div className={classes.wrapper}>
        {store.gallerySolutions.map((s) => <GalleryItem solution={s} key={s.id} />)}
      </div>
    </div>;
  }
}

export default withStyles(styles)(Gallery);
