import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {ISolution} from '../model/interfaces';

const styles = (_theme: Theme) => createStyles({
  root: {

  }
});



export interface IMareyChartProps extends WithStyles<typeof styles>, IWithStore {
  solution: ISolution;
}


@inject('store')
@observer
class MareyChart extends React.Component<IMareyChartProps> {
  render() {
    const classes = this.props.classes;
    // const store = this.props.store!;

    return <div className={classes.root}>
    </div>;
  }
}

export default withStyles(styles)(MareyChart);
