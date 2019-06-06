import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';

const styles = (_theme: Theme) => createStyles({
  root: {

  }
});



export interface IGalleryItemProps extends WithStyles<typeof styles>, IWithStore {

}


@inject('store')
@observer
class GalleryItem extends React.Component<IGalleryItemProps> {
  render() {
    const classes = this.props.classes;
    const store = this.props.store!;

    return <div className={classes.root}>
    </div>;
  }
}

export default withStyles(styles)(GalleryItem);
