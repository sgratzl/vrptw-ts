import {IOrderConstraint, IConstraints, ISolution, IServedCustomer, ITruck, ICustomer, isDepot, ITruckRoute} from './interfaces';
import model from 'raw-loader!../model/model.mzn';

export const MODEL = model;

export function buildOrderConstraint(constraints: IOrderConstraint[]) {
  if (constraints.length === 0) {
    return '';
  }

  return `
constraint forall (i, j in Customers) (
  if (${constraints.map(({from, to}) => `(i == ${from.id} /\\ j == ${to.id})`).join(` \\/ `)})
  then
      startOfService[i]+serviceTime[i] <= arrivalTime[j] /\\
      vehicleOf[i] == vehicleOf[j]
  else
      startOfService[i]+serviceTime[i] >= 0
  endif
)`;
}


export function constraints2code(constraints: IConstraints) {
  // TODO so far just support for partial order ones
  return buildOrderConstraint(constraints.partialOrderConstraints);
}

export function checkGenericTruck(truck: ITruckRoute) {
  const violations: string[] = [];

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
  return violations;
}

export function checkGenericConstraints(solution: ISolution) {
  const violations: string[] = [];

  for (const truck of solution.trucks) {
    violations.push(...checkGenericTruck(truck));
  }
  return violations;
}

export function checkTruckConstraints(route: ITruckRoute, constraints: IConstraints) {
  if (constraints.lockedCustomers.length === 0 && constraints.lockedTrucks.length === 0 && constraints.partialOrderConstraints.length === 0) {
    return [];
  }

  const violations: string[] = [];

  const customers = new Map<number, {customer: ICustomer, served: IServedCustomer, truck: ITruck}>();
  for (const served of route.route) {
    if (isDepot(served.customer)) {
      continue;
    }
    customers.set(served.customer.id, {
      customer: served.customer,
      served,
      truck: route.truck
    });
  }

  for (const order of constraints.partialOrderConstraints) {
    const from = customers.get(order.from.id);
    if (!from) {
      continue;
    }
    const to = customers.get(order.to.id);
    if (!to) {
      continue;
    }
    if (from.served.arrivalTime > to.served.arrivalTime) {
      violations.push(`Customer ${order.from.name} was not served before ${order.to.name}`);
      continue;
    }
  }

  for (const {customer, truck} of constraints.lockedCustomers) {
    const c = customers.get(customer.id);
    if (!c) {
      continue;
    }
    if (c.truck !== truck) {
      violations.push(`Customer ${customer.name} not served by truck ${truck.name}`);
      continue;
    }
  }

  for (const {customers, truck} of constraints.lockedTrucks) {
    if (route.truck !== truck) {
      continue;
    }
    customers.forEach((c, i) => {
      const served = route.route[i + 1]; // skip depot
      if (!served || c !== served.customer) {
        violations.push(`Truck ${truck.name} not serving customer ${c.name} in proper order`);
        return;
      }
    });
  }

  return violations;
}

export function checkConstraints(solution: ISolution, constraints: IConstraints) {
  if (constraints.lockedCustomers.length === 0 && constraints.lockedTrucks.length === 0 && constraints.partialOrderConstraints.length === 0) {
    return [];
  }

  const violations: string[] = [];

  const customers = new Map<number, {customer: ICustomer, served: IServedCustomer, truck: ITruck}>();
  for (const truck of solution.trucks) {
    for (const served of truck.route) {
      if (isDepot(served.customer)) {
        continue;
      }
      customers.set(served.customer.id, {
        customer: served.customer,
        served,
        truck: truck.truck
      });
    }
  }

  for (const order of constraints.partialOrderConstraints) {
    const from = customers.get(order.from.id);
    if (!from) {
      violations.push(`Customer ${order.from.name} not served`);
      continue;
    }
    const to = customers.get(order.to.id);
    if (!to) {
      violations.push(`Customer ${order.to.name} not served`);
      continue;
    }
    if (from.truck !== to.truck) {
      violations.push(`Customer ${order.from.name} and ${order.to.name} are not served by the same truck`);
      continue;
    }
    if (from.served.arrivalTime > to.served.arrivalTime) {
      violations.push(`Customer ${order.from.name} was not served before ${order.to.name}`);
      continue;
    }
  }

  for (const {customer, truck} of constraints.lockedCustomers) {
    const c = customers.get(customer.id);
    if (!c) {
      violations.push(`Customer ${customer.name} not served`);
      continue;
    }
    if (c.truck !== truck) {
      violations.push(`Customer ${customer.name} not served by truck ${truck.name}`);
      continue;
    }
  }

  for (const {customers, truck} of constraints.lockedTrucks) {
    const route = solution.trucks.find((d) => d.truck === truck);
    if (!route) {
      violations.push(`Truck ${truck.name} not used`);
      continue;
    }
    customers.forEach((c, i) => {
      const served = route.route[i + 1]; // skip depot
      if (!served || c !== served.customer) {
        violations.push(`Truck ${truck.name} not serving customer ${c.name} in proper order`);
        return;
      }
    });
  }

  return violations;
}

export function isValidTruckRoute(route: ITruckRoute, constraints: IConstraints, constraints2: IConstraints) {
  return checkGenericTruck(route).length === 0 && checkTruckConstraints(route, constraints).length === 0 && checkTruckConstraints(route, constraints2).length === 0;
}
