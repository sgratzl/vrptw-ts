import React from 'react';
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
    display: 'grid',
    gridTemplateRows: `3fr 1fr`,
    gridTemplateColumns: `3fr 3fr 1fr`,
    gridTemplateAreas: `"left right gallery" "history history gallery"`,
    gridGap: '0.5rem'
  },
  left: {
    minHeight: 0,
    gridArea: 'left',
  },
  right: {
    minHeight: 0,
    gridArea: 'right',
  },
  history: {
    minHeight: 0,
    gridArea: 'history',
  },
  gallery: {
    minHeight: 0,
    gridArea: 'gallery',
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
            Vechicle Routing Problem
          </Typography>
        </Toolbar>
      </AppBar>
      <main className={classes.main}>
        {store.leftSelectedSolution && <Solution solution={store.leftSelectedSolution} orientation="left" className={classes.left}/> }
        {store.rightSelectedSolution && <Solution solution={store.rightSelectedSolution} orientation="right" className={classes.right} />}
        <SolutionHistory className={classes.history} />
        <Gallery className={classes.gallery}/>
      </main>
    </div>;
  }
}

export default withStyles(styles)(App);
