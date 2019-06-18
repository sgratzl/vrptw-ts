import React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'mobx-react';
import App from './App';
import {ApplicationStore} from './stores';
import 'typeface-roboto';
import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const store = new ApplicationStore();

ReactDOM.render((
  <Provider store={store}>
  <DndProvider backend={HTML5Backend}>
    <App />
  </DndProvider>
  </Provider>
), document.getElementById('root')!);
