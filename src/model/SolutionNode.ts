import {IConstraints, IOrderConstraint, ILockedCustomerConstraint, ISolution, ILockedTruckConstraint, IProblem, isDepot} from './interfaces';
import {observable, computed, action} from 'mobx';
import {problem2params} from './problem';
import {MODEL, constraints2code, checkConstraints} from './constraints';

export enum ESolutionNodeState {
  INTERACTIVE = 'interactive',
  SOLVING = 'solving',
  SATISFIED = 'satisfied',
  TIMEDOUT = 'timeout',
  UNSATISFIABLE = 'unsatifiable',
}


export default class SolutionNode implements IConstraints, ISolution {
  @observable
  children: SolutionNode[] = [];

  @observable
  name: string;
  @observable
  state: ESolutionNodeState = ESolutionNodeState.INTERACTIVE;

  // solution
  @observable
  solution: ISolution = {
    distance: NaN,
    finishTime: NaN,
    trucks: []
  };
  partialResultDistances: number[] = [];

  @observable
  partialOrderConstraints: IOrderConstraint[] = [];
  @observable
  lockedCustomers: ILockedCustomerConstraint[] = [];
  @observable
  lockedTrucks: ILockedTruckConstraint[] = [];

  @observable
  violations: string[] = [];

  constructor(public readonly id: number, public readonly problem: IProblem, public readonly parent?: SolutionNode) {
    this.name = `Solution ${id + 1}`;
    if (!parent) {
      return;
    }
    parent.children.push(this);
    // copy constraints
    this.partialOrderConstraints = parent.partialOrderConstraints.slice();
    this.lockedCustomers = parent.lockedCustomers.slice();
    this.lockedTrucks = parent.lockedTrucks.slice();
    // copy solution
    this.solution = parent.solution;
    this.violations = parent.violations;
  }

  @computed
  get model() {
    return `${MODEL}\n\n${constraints2code(this.problem)}\n\n${constraints2code(this)}`;
  }

  @computed
  get params() {
    return problem2params(this.problem);
  }

  @action
  pushSolution(solution: ISolution) {
    // best one so far
    this.solution = solution;
    this.partialResultDistances.push(solution.distance);

    this.violations = this.checkViolations();
  }

  private checkViolations() {
    const violations: string[] = [];
    // check inherit constraints
    for (const truck of this.solution.trucks) {
      if (truck.usedCapacity > truck.truck.capacity) {
        violations.push(`Truck ${truck.truck.name} used a capacity of ${truck.usedCapacity}/${truck.truck.capacity}`);
      }

      for (const served of truck.route) {
        const customer = served.customer;
        if (isDepot(customer)) {
          continue;
        }
        if (served.startOfService < customer.startTime) {
          violations.push(`Customer ${customer.name} served by ${truck.truck.name} before his/her start time`);
        }
        if ((served.startOfService + customer.serviceTime) > customer.endTime) {
          violations.push(`Customer ${customer.name} served by ${truck.truck.name} after or longer than his/her end time`);
        }
      }
    }

    // check custom constraints
    violations.push(...checkConstraints(this.solution, this.problem));
    violations.push(...checkConstraints(this.solution, this));

    return violations;
  }

  @computed
  get distance() {
    return this.solution.distance;
  }

  @computed
  get finishTime() {
    return this.solution.finishTime;
  }

  @computed
  get trucks() {
    return this.solution.trucks;
  }
}
