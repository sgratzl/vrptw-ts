import {observable, action, computed} from 'mobx';
import RESTMiniZinc from 'minizinc/build/RESTMiniZinc';
import {IProblem, IOrderConstraint, IServerSolution, ISolution} from '../model/interfaces';
import problem, {problem2params} from '../model/problem';
import model from 'raw-loader!../model/model.mzn';
import parseSolution from '../model/parseSolution';
import {buildOrderConstraint} from '../model/constraints';

export interface IUIFlags {

}

export class ApplicationStore {

  private readonly backend = new RESTMiniZinc();

  @observable
  ui: IUIFlags = {
  };


  @observable
  problem: IProblem = problem;

  @observable
  orderConstraints: IOrderConstraint[] = [];

  private solutionCounter = 0;

  @observable
  solutions: ISolution[] = [];

  @observable
  gallerySolutions: ISolution[] = [];

  @observable
  leftSelectedSolution: ISolution | null = null;
  @observable
  rightSelectedSolution: ISolution | null = null;

  constructor() {
    this.solve();
  }

  @action
  solve() {
    const fullModel = model + this.extraConstraints.join('\n');

    this.backend.solve({
      model: fullModel,
      all_solutions: true
    }, this.params).then((result) => {
      const solutions = result.solutions.map((s) => (<IServerSolution><unknown>s.assignments));
      Promise.all(solutions.map((s) => parseSolution(this.problem, s, this.solutionCounter++))).then((solutions) => {
        this.solutions.push(...solutions);
        if (!this.leftSelectedSolution) {
          this.leftSelectedSolution = this.solutions[0];
        }
        if (!this.rightSelectedSolution) {
          this.rightSelectedSolution = this.solutions[1];
        }
      });
    });
  }

  @computed
  private get extraConstraints() {
    return [
      buildOrderConstraint(this.orderConstraints)
    ];
  }

  @computed
  private get params() {
    return problem2params(this.problem);
  }

  @computed
  get maxDistance() {
    return this.solutions.reduce((acc, s) => Math.max(acc, s.distance), 0);
  }
}
