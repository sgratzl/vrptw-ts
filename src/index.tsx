import React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'mobx-react';
import App from './App';
import {ApplicationStore} from './stores';
import 'typeface-roboto';

const store = new ApplicationStore();

ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('root')!);
