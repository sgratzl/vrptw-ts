import {IConstraints, IOrderConstraint, ILockedCustomerConstraint, ISolution, ILockedTruckConstraint, IProblem, isDepot, ICustomer, ITruck, ITruckRoute} from './interfaces';
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

    this.checkViolations();
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
        if (served.startOfService > customer.endTime) {
          violations.push(`Customer ${customer.name} served by ${truck.truck.name} after his/her end time`);
        }
      }
    }

    // check custom constraints
    violations.push(...checkConstraints(this.solution, this.problem));
    violations.push(...checkConstraints(this.solution, this));

    this.violations = violations;
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

  @computed
  get valid() {
    return this.violations.length === 0;
  }

  isCustomerLocked(truck: ITruck, customer: ICustomer) {
    if (isDepot(customer)) {
      return false;
    }
    return this.lockedCustomers.find((d) => d.truck === truck && d.customer === customer);
  }

  @action
  toggleCustomerLocked(truck: ITruck, customer: ICustomer) {
    if (isDepot(customer)) {
      return;
    }
    const index = this.lockedCustomers.findIndex((d) => d.truck === truck && d.customer === customer);
    // TODO need to fork?
    if (index >= 0) {
      this.lockedCustomers.splice(index, 1);
    } else {
      this.lockedCustomers.push({truck, customer});
    }

    this.checkViolations();
  }

  isTruckLocked(truck: ITruckRoute) {
    return this.lockedTrucks.find((d) => d.truck === truck.truck);
  }

  @action
  toggleTruckLocked(truck: ITruckRoute) {
    const index = this.lockedTrucks.findIndex((d) => d.truck === truck.truck);
    // TODO need to fork?
    if (index >= 0) {
      this.lockedTrucks.splice(index, 1);
    } else {
      this.lockedTrucks.push({truck: truck.truck, customers: truck.route.filter((d) => !isDepot(d.customer)).map((d) => d.customer)});
    }

    this.checkViolations();
  }

  @computed
  get customConstraints() {
    return this.lockedCustomers.length + this.lockedTrucks.length + this.partialOrderConstraints.length;
  }

  @computed
  get hash() {
    // unique solution per route of all trucks
    return JSON.stringify(this.trucks.map((d) => d.route.map((d) => d.customer.id)));
  }

}
