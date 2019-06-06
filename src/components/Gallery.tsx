import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';

const styles = (_theme: Theme) => createStyles({
  root: {

  }
});



export interface IGalleryProps extends WithStyles<typeof styles>, IWithStore {

}


@inject('store')
@observer
class Gallery extends React.Component<IGalleryProps> {
  render() {
    const classes = this.props.classes;
    const store = this.props.store!;

    return <div className={classes.root}>
    </div>;
  }
}

export default withStyles(styles)(Gallery);
