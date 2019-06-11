import {IOrderConstraint, IConstraints, ISolution, IServedCustomer, ITruck, ICustomer, isDepot, ITruckRoute, ILockedCustomerConstraint, ILockedTruckConstraint} from './interfaces';
import model from 'raw-loader!../model/model.mzn';

export const MODEL = model;

function buildOrderConstraint(constraints: IOrderConstraint[]) {
  // same vehicle and served before the other
  return constraints.map((d) => `constraint :: "${d.from.id} served before ${d.to.id}" vehicleOf[${d.from.id}] == vehicleOf[${d.to.id}] /\\ startOfService[${d.from.id}] + serviceTime[${d.from.id}] <= arrivalTime[${d.to.id}];`).join('\n');
}

function buildCustomerLockConstraint(constraints: ILockedCustomerConstraint[]) {
  return constraints.map((d) => `constraint :: "${d.customer.id} served by ${d.truck.id}" vehicleOf[${d.customer.id}] == ${d.truck.id};`).join('\n');
}

function buildTruckLockConstraint(constraints: ILockedTruckConstraint[]) {
  // TODO proper customer order using successor
  return constraints.map((d) => `constraint :: "${d.truck.id} serves ${d.customers.map((d) => d.id).join('->')}" ${d.customers.map((c) => `vehicleOf[${c.id}] == ${d.truck.id}`).join(' /\\ ')};`).join('\n');
}

export function constraints2code(constraints: IConstraints) {
  return `
${buildOrderConstraint(constraints.partialOrderConstraints)}
${buildCustomerLockConstraint(constraints.lockedCustomers)}
${buildTruckLockConstraint(constraints.lockedTrucks)}
`;
}

export function checkGenericTruck(truck: ITruckRoute) {
  const violations: string[] = [];

  if (truck.usedCapacity > truck.truck.capacity) {
    violations.push(`Truck ${truck.truck.name} used a capacity of ${truck.usedCapacity}/${truck.truck.capacity}`);
  }
  let prev: IServedCustomer | null = null;
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
    if (!prev) {
      prev = served;
      continue;
    }
    if ((prev.departureTime + served.timeTo) > served.arrivalTime) {
      violations.push(`Cannot arrive at customer ${customer.name} before departing from the previous customer ${prev.customer.name}`);
    }

    prev = served;
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
