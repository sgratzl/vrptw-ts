import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {ISolution} from '../model/interfaces';

const styles = (_theme: Theme) => createStyles({
  root: {
    display: 'flex',
    position: 'relative',
    alignItems: 'flex-end',
    padding: '0 1rem',
    borderBottom: '2px solid black',
  },
  bar: {
    marginRight: '1rem',
    position: 'relative',
    width: '2rem',
    height: '0%',
    transition: 'height 0.5 ease',
    background: 'lightgrey',
    cursor: 'pointer',

    '&::before': {
      content: 'attr(title)',
      position: 'absolute',
      top: '100%',
      fontSize: 'x-small',
      textAlign: 'center',
      left: '-3em',
      right: '-3em'
    },

    '&::after': {
      content: 'attr(data-distance)',
      position: 'absolute',
      bottom: '100%',
      fontSize: 'small',
      textAlign: 'center',
      left: '-3em',
      right: '-3em',
      opacity: 0,
      transition: 'opacity 0.5s ease'
    },

    '&:hover::after': {
      opacity: 1,
    }
  }
});



export interface ISolutionHistoryProps extends WithStyles<typeof styles>, IWithStore {

}


@inject('store')
@observer
class SolutionHistory extends React.Component<ISolutionHistoryProps> {
  private onBarClick(solution: ISolution) {
    const store = this.props.store!;
    if (!store.leftSelectedSolution) {
      store.leftSelectedSolution = solution;
    } else {
      store.rightSelectedSolution = solution;
    }
    if (!store.gallerySolutions.includes(solution)) {
      store.gallerySolutions.push(solution);
    }
  }


  render() {
    const classes = this.props.classes;
    const store = this.props.store!;


    const toPercent = (distance: number) => Math.round(100 * 100 * distance / store.maxDistance) / 100;

    return <div className={classes.root}>
      {store.solutions.map((s) => <div
        key={s.id} className={classes.bar} title={s.name} data-distance={`${Math.round(s.distance / 100) / 10 } km`} style={{height: `${toPercent(s.distance)}%`}}
        onClick={() => this.onBarClick(s)}
      />)}
    </div>;
  }
}

export default withStyles(styles)(SolutionHistory);
