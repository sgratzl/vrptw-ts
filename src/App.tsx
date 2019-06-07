import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from './stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {AppBar, CssBaseline, Toolbar, Typography} from '@material-ui/core';
import Solution from './components/Solution';
import Gallery from './components/Gallery';
import SolutionHistory from './components/SolutionHistory';

const styles = (_theme: Theme) => createStyles({
  root: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  main: {
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column'
  },
  compare: {
    flex: '0 0 auto',
    display: 'flex',
    '& > *': {
      flex: '1 1 0',
      marginLeft: '1rem',
      marginRight: '1rem'
    }
  },
  history: {
    flex: '0 0 8rem',
  },
  gallery: {
    flex: '0 0 auto',
  }
});



export interface IAppProps extends WithStyles<typeof styles>, IWithStore {

}


@inject('store')
@observer
class App extends React.Component<IAppProps> {
  render() {
    const classes = this.props.classes;
    const store = this.props.store!;

    return <div className={classes.root}>
      <CssBaseline />
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="h6" color="inherit">
            VRPTW
          </Typography>
        </Toolbar>
      </AppBar>
      <main className={classes.main}>
        <section className={classes.compare}>
          <Solution solution={store.leftSelectedSolution} orientation="left" />
          <Solution solution={store.rightSelectedSolution} orientation="right" />
        </section>
        <SolutionHistory className={classes.history} />
        <Gallery className={classes.gallery}/>
      </main>
    </div>;
  }
}

export default withStyles(styles)(App);
