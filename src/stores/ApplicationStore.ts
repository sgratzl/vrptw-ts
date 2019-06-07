import {EStatus} from 'minizinc';
import RESTMiniZinc from 'minizinc/build/RESTMiniZinc';
import {action, computed, observable} from 'mobx';
import {ICustomer, IProblem, IServerSolution, ITruck} from '../model/interfaces';
import parseSolution from '../model/parseSolution';
import problem from '../model/problem';
import SolutionNode, {ESolutionNodeState} from '../model/SolutionNode';

export interface IUIFlags {
  dummy: boolean;
}

export class ApplicationStore {

  private readonly backend = new RESTMiniZinc();
  private solutionCounter = 0;

  @observable
  ui: IUIFlags = {
    dummy: false
  };

  @observable
  rootProblem: IProblem = problem;

  @observable
  solutions: SolutionNode[] = [];

  @observable
  gallerySolutions: SolutionNode[] = [];

  @observable
  leftSelectedSolution: SolutionNode | null = null;
  @observable
  rightSelectedSolution: SolutionNode | null = null;

  @observable
  solving: boolean = false;

  @observable
  hoveredSolution: SolutionNode | null = null;
  @observable
  hoveredTruck: ITruck | null = null;
  @observable
  hoveredCustomer: ICustomer | null = null;

  constructor() {
    this.solveFresh();
  }

  @action
  solve(node: SolutionNode) {
    this.solving = true;
    node.state = ESolutionNodeState.SOLVING;
    this.backend.solve({
      model: node.model,
      all_solutions: true
    }, node.params, {
        onPartialResult: (type, result) => {
          if (type !== 'solution') {
            return;
          }
          // save solution state
          const best = (<IServerSolution><unknown>result.solutions[result.solutions.length - 1].assignments);
          parseSolution(node.problem, best).then((s) => {
            node.pushSolution(s);
          });
        }
      }).then((result) => {
        if (result.status === EStatus.OPTIMAL_SOLUTION || result.status === EStatus.ALL_SOLUTIONS || result.status === EStatus.SATISFIED) {
          node.state = ESolutionNodeState.SATISFIED;
        } else {
          node.state = ESolutionNodeState.UNSATISFIABLE;
        }
        if (result.solutions.length <= 0) {
          return;
        }
        const best = (<IServerSolution><unknown>result.solutions[result.solutions.length - 1].assignments);
        if (node.solution.distance === best.objective) {
          return;
        }
        // has changed or no intermediate solutions
        return parseSolution(node.problem, best).then((s) => {
          node.pushSolution(s);
        });
      }).catch((error) => {
        console.warn('error while computing solutions', error);
        node.state = ESolutionNodeState.UNSATISFIABLE;
      }).finally(() => {
        this.solving = false;
    });
  }

  @action
  solveFresh() {
    const node = new SolutionNode(this.solutionCounter++, this.rootProblem);
    this.solutions.push(node);
    if (!this.leftSelectedSolution) {
      this.leftSelectedSolution = node;
    }
    return this.solve(node);
  }

  @computed
  get maxDistance() {
    return this.solutions.reduce((acc, s) => Math.max(acc, s.distance), 0);
  }

  @computed
  get maxFinishTime() {
    return this.solutions.reduce((acc, s) => Math.max(acc, s.finishTime), 0);
  }
}
