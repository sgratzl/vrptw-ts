import {IConstraints, IOrderConstraint, ILockedCustomerConstraint, ISolution, ILockedTruckConstraint, IProblem, isDepot, ICustomer, ITruck, ITruckRoute, IServedCustomer} from './interfaces';
import {observable, computed, action} from 'mobx';
import {problem2params} from './problem';
import {MODEL, constraints2code, checkConstraints, checkGenericConstraints} from './constraints';
import {rerouteTruck} from './parseSolution';

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
    // copy solution (deepish)
    this.solution = Object.assign({}, parent.solution, {
      trucks: parent.solution.trucks.map((t) => Object.assign({}, t, {
        route: t.route.map((c) => Object.assign({}, c))
      }))
    });

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
  setSolution(solution: ISolution) {
    // best one so far
    this.solution = solution;

    this.checkViolations();
  }

  private checkViolations() {
    const violations: string[] = [];
    violations.push(...checkGenericConstraints(this.solution));
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
    if (index >= 0) {
      this.lockedTrucks.splice(index, 1);
    } else {
      this.lockedTrucks.push({truck: truck.truck, customers: truck.route.filter((d) => !isDepot(d.customer)).map((d) => d.customer)});
    }

    this.checkViolations();
  }

  @action
  createPartialOrder(from: ICustomer, to: ICustomer) {
    if (this.partialOrderConstraints.find((d) => d.from === from && d.to === to)) {
      return; // duplicate
    }
    this.partialOrderConstraints.push({from, to});

    this.checkViolations();
  }

  @action
  removePartialOrder(order: IOrderConstraint) {
    const index = this.partialOrderConstraints.findIndex((d) => d.from === order.from && d.to === order.to);
    if (index < 0) {
      return;
    }
    this.partialOrderConstraints.splice(index, 1);
  }

  @action
  moveCustomerBefore(customer: ICustomer, before: ICustomer) {
    if (isDepot(customer) || isDepot(before) || customer === before) {
      return;
    }

    // modify solution to move the customer to the right truck, even if it destroys everthing for now
    let served: IServedCustomer | null = null;
    let currentRoute: ITruckRoute | null = null;
    for (const t of this.trucks) {
      const index = t.route.findIndex((d) => d.customer === customer);
      if (index < 0) {
        continue;
      }
      currentRoute = t;
      served = t.route.splice(index, 1)[0];
      t.usedCapacity -= customer.demand;
      break;
    }
    if (!served || !currentRoute) {
      return;
    }

    let nextRoute: ITruckRoute | null = null;
    for (const t of this.trucks) {
      const index = t.route.findIndex((d) => d.customer === before);
      if (index < 0) {
        continue;
      }
      nextRoute = t;
      // inject
      nextRoute.route.splice(index, 0, served);
      nextRoute.usedCapacity += customer.demand;
      break;
    }
    if (!nextRoute) {
      return;
    }

    if (currentRoute !== nextRoute) {
      // remove old constraint and create a new one if the truck changes
      const index = this.lockedCustomers.findIndex((d) => d.customer === customer);
      if (index >= 0) {
        this.lockedCustomers.splice(index, 1);
      }
      this.lockedCustomers.push({truck: nextRoute!.truck, customer});
    }
    this.checkViolations();

    if (currentRoute === nextRoute) {
      // optimize only the same
      return Promise.resolve(rerouteTruck(this.problem, nextRoute)).then(() => this.checkViolations());
    }
    // optimize both
    return Promise.all([
      rerouteTruck(this.problem, currentRoute),
      rerouteTruck(this.problem, nextRoute)
    ]).then(() => this.checkViolations());
  }

  @computed
  get countCustomConstraints() {
    return this.lockedCustomers.length + this.lockedTrucks.length + this.partialOrderConstraints.length;
  }

  @computed
  get hash() {
    // unique solution per route of all trucks
    return JSON.stringify(this.trucks.map((d) => d.route.map((d) => d.customer.id)));
  }

}
