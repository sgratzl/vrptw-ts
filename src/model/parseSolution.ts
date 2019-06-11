import computeRoute from '../server/route';
import {IProblem, IServerSolution, ITruckRoute, ISolution, isDepot, IServedCustomer, IConstraints} from './interfaces';
import {permutation} from 'js-combinatorics';
import {isValidTruckRoute} from './constraints';

export default function parseSolution(problem: IProblem, solution: IServerSolution): Promise<ISolution> {
  const depot = problem.depot;

  const trucks: ITruckRoute[] = problem.trucks.map((truck) => ({
    truck,
    usedCapacity: 0,
    totalDistance: 0,
    startTime: 0,
    finishTime: 0,
    wayPoints: [],
    route: []
  }));
  const truckById = (id: number) => trucks[id - 1];
  const customerById = (id: number) => id > problem.customers.length ? depot : problem.customers[id - 1];

  // assign all points to a truck
  solution.successor.forEach((_, i) => {
    const truck = truckById(solution.vehicleOf[i]);
    const customer = customerById(i + 1);
    const arrivalTime = solution.arrivalTime[i];
    const startOfService = solution.startOfService[i];

    truck.usedCapacity += customer.demand;

    const servedCustomer = {
      customer,
      arrivalTime,
      startOfService,
      endOfService: startOfService + customer.serviceTime,
      departureTime: NaN, // computed after
      distanceTo: NaN, // computed later
      timeTo: NaN
    };
    truck.route.push(servedCustomer);
  });

  let finishTime = 0;

  for (const truck of trucks) {
    if (truck.route.length === 0) {
      truck.startTime = NaN;
    }

    const route = truck.route;
    // sort by arrivalTime
    route.sort((a, b) => a.arrivalTime - b.arrivalTime);

    console.assert(route[0].customer === depot, 'being at depot');
    console.assert(route[truck.route.length - 1].customer === depot, 'end at depot');

    const start = route[0];
    truck.startTime = start.arrivalTime;
    start.distanceTo = 0;

    const end = route[route.length - 1];
    truck.finishTime = end.arrivalTime;
    end.departureTime = end.arrivalTime;

    finishTime = Math.max(finishTime, truck.finishTime);

    // compute distances between route
    for (let i = 1; i < route.length; i++) {
      const to = route[i];
      const from = route[i - 1];
      const distance = problem.distances[from.customer.id - 1][to.customer.id - 1];
      const travelTime = problem.travelTimes[from.customer.id - 1][to.customer.id - 1];
      to.distanceTo = distance;
      to.timeTo = travelTime;
      from.departureTime = to.arrivalTime - travelTime;
      truck.totalDistance += distance;
    }
  }

  return Promise.all(trucks.filter((d) => d.route.length > 0).map(computeRouteWayPoints)).then(() => ({
    distance: solution.objective,
    finishTime,
    trucks
  }));
}

function computeRouteWayPoints(truck: ITruckRoute) {
  return computeRoute(truck.route.map((t) => t.customer)).then((wayPoints) => {
    truck.wayPoints = wayPoints;
    return truck;
  });
}


export function optimizeLocally(problem: IProblem, truck: ITruckRoute, constraints: IConstraints) {
  if (truck.usedCapacity > truck.truck.capacity) {
    return false; // cannot optimize
  }

  const customers = truck.route.map((d) => d.customer).filter((d) => !isDepot(d));

  let best: ITruckRoute | null = null;

  permutation(customers).forEach((order) => {
    // create complete route
    order = order.slice();
    order.unshift(problem.depot);
    order.push(problem.depot);

    const route: IServedCustomer[] = [];
    for (let i = 0; i < order.length; i++) {
      const c = order[i];
      if (i === 0) {
        route.push({
          customer: c,
          arrivalTime: 0,
          departureTime: 0,
          distanceTo: 0,
          endOfService: 0,
          startOfService: 0,
          timeTo: 0,
        });
        continue;
      }
      const prev = route[i - 1];
      const distanceTo = problem.distances[prev.customer.id - 1]![c.id - 1]!;
      const timeTo = problem.travelTimes[prev.customer.id - 1]![c.id - 1]!;
      const arrivalTime = prev.departureTime + timeTo;
      const startOfService = Math.max(arrivalTime, c.startTime);
      if (startOfService > c.startTime) {
        // invalid solution
        return;
      }
      route.push({
        customer: c,
        arrivalTime,
        distanceTo,
        timeTo,
        startOfService,
        endOfService: startOfService + c.serviceTime,
        departureTime: startOfService + c.serviceTime
      });
    }
    const totalDistance = route.reduce((acc, a) => acc + a.distanceTo, 0);
    const test = Object.assign({}, truck, {totalDistance, route});

    if (!isValidTruckRoute(test, problem, constraints)) {
      return;
    }

    if (!best || best.totalDistance > totalDistance) {
      best = test;
    }
  });

  if (!best) {
    return false;
  }

  // found a better solution
  Object.assign(truck, best);
  Object.assign(truck, {
    startTime: truck.route[0].arrivalTime,
    totalTime: truck.route[truck.route.length - 1].departureTime
  });

  return computeRouteWayPoints(truck);
}
