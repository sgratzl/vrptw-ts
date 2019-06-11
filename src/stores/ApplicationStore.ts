import {EStatus} from 'minizinc';
import RESTMiniZinc from 'minizinc/build/RESTMiniZinc';
import {action, computed, observable} from 'mobx';
import {ICustomer, IProblem, IServerSolution, ITruck, ITruckRoute} from '../model/interfaces';
import parseSolution from '../model/parseSolution';
import problem from '../model/problem';
import SolutionNode, {ESolutionNodeState} from '../model/SolutionNode';

export interface IUIFlags {
  visibleViolationAnchor: HTMLElement | null;
  visibleViolationSolution: SolutionNode | null;
  visibleHistoryAnchor: HTMLElement | null;
  visibleHistorySolution: SolutionNode | null;
}

export class ApplicationStore {

  private readonly backend = new RESTMiniZinc();
  private solutionCounter = 0;

  @observable
  ui: IUIFlags = {
    visibleViolationAnchor: null,
    visibleViolationSolution: null,
    visibleHistoryAnchor: null,
    visibleHistorySolution: null
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
    if (this.gallerySolutions.length === 0) {
      this.gallerySolutions.push(node);
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

  @action
  private fork(solution: SolutionNode) {
    const fork = new SolutionNode(this.solutionCounter++, solution.problem, solution);
    this.solutions.push(fork);
    // in place replacement
    if (this.leftSelectedSolution === solution) {
      this.leftSelectedSolution = fork;
    }
    if (this.rightSelectedSolution === solution) {
      this.rightSelectedSolution = fork;
    }
    if (this.hoveredSolution === solution) {
      this.hoveredSolution = fork;
    }
    const galleryIndex = this.gallerySolutions.indexOf(solution);
    if (galleryIndex >= 0) {
      this.gallerySolutions.splice(galleryIndex, 1, fork);
    }
    return fork;
  }

  @action
  toggleCustomerLocked(solution: SolutionNode, truck: ITruck, customer: ICustomer) {
    if (solution.state !== ESolutionNodeState.INTERACTIVE) {
      solution = this.fork(solution);
    }
    solution.toggleCustomerLocked(truck, customer);
  }

  @action
  toggleTruckLocked(solution: SolutionNode, truck: ITruckRoute) {
    if (solution.state !== ESolutionNodeState.INTERACTIVE) {
      solution = this.fork(solution);
    }
    solution.toggleTruckLocked(truck);
  }

  @action
  moveCustomer(solution: SolutionNode, truck: ITruck, customer: ICustomer) {
    if (solution.state !== ESolutionNodeState.INTERACTIVE) {
      solution = this.fork(solution);
    }
    solution.moveCustomer(truck, customer);
  }

  isInGallery(solution: SolutionNode) {
    return this.gallerySolutions.includes(solution);
  }

  @action
  toggleInGallery(solution: SolutionNode) {
    const index = this.gallerySolutions.indexOf(solution);
    if (index >= 0) {
      this.gallerySolutions.splice(index, 1);
    } else {
      this.gallerySolutions.push(solution);
    }
  }

  isInFocus(solution: SolutionNode) {
    return this.leftSelectedSolution === solution || this.rightSelectedSolution === solution;
  }

}
