import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from './stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {AppBar, CssBaseline} from '@material-ui/core';

const styles = (theme: Theme) => createStyles({
  root: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  appBarSpacer: theme.mixins.toolbar,
  main: {
    flex: '1 1 0',
    display: 'grid',
  },
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
      <AppBar>

      </AppBar>

      <div className={classes.appBarSpacer} />
      <main className={classes.main}>
      </main>
    </div>;
  }
}

export default withStyles(styles)(App);
