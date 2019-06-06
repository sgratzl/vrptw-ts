import {observable} from 'mobx';

export interface IUIFlags {

}

export class ApplicationStore {

  @observable
  ui: IUIFlags = {
  };

}
