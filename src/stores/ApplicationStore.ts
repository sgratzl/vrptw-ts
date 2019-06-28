import {EStatus} from 'minizinc';
import createMiniZinc from 'minizinc/build/internal/workerloader';
import {action, computed, observable} from 'mobx';
import {ICustomer, IProblem, IServerSolution, ITruck, ITruckRoute, IOrderConstraint} from '../model/interfaces';
import parseSolution from '../model/parseSolution';
import problem from '../model/problem';
import SolutionNode, {ESolutionNodeState} from '../model/SolutionNode';
import {initialResult} from '../model/initial';

export interface IUIFlags {
  // for showing the violations popup
  visibleViolationAnchor: HTMLElement | null;
  visibleViolationSolution: SolutionNode | null;

  // for showing the history popover
  visibleHistoryAnchor: HTMLElement | null;
  visibleHistorySolution: SolutionNode | null;
}

export class ApplicationStore {

  private readonly backend = createMiniZinc();
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
  readonly solutions: SolutionNode[] = [];

  @observable
  readonly gallerySolutions: SolutionNode[] = [];

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
    this.solveInitial();
  }

  @action
  solve(node: SolutionNode) {
    this.solving = true;
    node.state = ESolutionNodeState.SOLVING;
    this.backend.solve(node.model, node.params).then((result) => {
      if (result.status === EStatus.OPTIMAL_SOLUTION || result.status === EStatus.ALL_SOLUTIONS || result.status === EStatus.SATISFIED) {
        node.state = ESolutionNodeState.SATISFIED;
      } else {
        node.state = ESolutionNodeState.UNSATISFIABLE;
      }
      if (result.solutions.length <= 0) {
        return;
      }
      const best = (<IServerSolution><unknown>result.solutions[result.solutions.length - 1].assignments);
      return parseSolution(node.problem, best).then((s) => {
        node.setSolution(s);
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

  private solveInitial() {
    const node = new SolutionNode(this.solutionCounter++, this.rootProblem);
    this.solutions.push(node);
    if (!this.leftSelectedSolution) {
      this.leftSelectedSolution = node;
    }
    if (this.gallerySolutions.length === 0) {
      this.gallerySolutions.push(node);
    }
    this.solving = true;
    node.state = ESolutionNodeState.SATISFIED;
    const best: IServerSolution = initialResult.solutions[initialResult.solutions.length - 1].assignments;
    parseSolution(node.problem, best).then((s) => {
      node.setSolution(s);
    });
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
  moveCustomerBefore(solution: SolutionNode, customer: ICustomer, before: ICustomer) {
    if (solution.state !== ESolutionNodeState.INTERACTIVE) {
      solution = this.fork(solution);
    }
    solution.moveCustomerBefore(customer, before);
  }

  @action
  createPartialOrder(solution: SolutionNode, from: ICustomer, to: ICustomer) {
    if (solution.state !== ESolutionNodeState.INTERACTIVE) {
      solution = this.fork(solution);
    }
    solution.createPartialOrder(from, to);
  }

  @action
  removePartialOrder(solution: SolutionNode, order: IOrderConstraint) {
    if (solution.state !== ESolutionNodeState.INTERACTIVE) {
      solution = this.fork(solution);
    }
    solution.removePartialOrder(order);
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
