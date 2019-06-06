import {observable, action, computed} from 'mobx';
import RESTMiniZinc from 'minizinc/build/RESTMiniZinc';
import {IProblem, IOrderConstraint, IServerSolution, ISolution} from '../model/interfaces';
import problem, {problem2params} from '../model/problem';
import model from 'raw-loader!../model/model.mzn';
import {buildOrderConstraint} from '../server/minizinc';
import parseSolution from '../model/parseSolution';

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

  @action
  solve() {
    const fullModel = model + this.extraConstraints.join('\n');

    this.backend.solve(fullModel, this.params).then((result) => {
      const solutions = result.solutions.map((s) => (<IServerSolution><unknown>s.assignments);
      Promise.all(solutions.map((s) => parseSolution(this.problem, s, this.solutionCounter++))).then((solutions) => {
        this.solutions.push(...solutions);
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
}
