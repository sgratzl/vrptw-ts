import computeRoute from '../server/route';
import {IProblem, IServedCustomer, IServerSolution, ITruckRoute, ILatLng, ISolution} from './interfaces';

export default function parseSolution(problem: IProblem, solution: IServerSolution): Promise<ISolution> {
  const depot = problem.depot;

  const servedCustomers: IServedCustomer[] = [];

  const trucks: ITruckRoute[] = problem.trucks.map((truck) => ({
    truck,
    usedCapacity: 0,
    totalDistance: 0,
    startTime: 0,
    finishTime: 0,
    route: []
  }));
  // since starting with 1
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
      timeTo: NaN,
      wayPointsTo: [] // computed later
    };
    servedCustomers.push(servedCustomer);
    truck.route.push(servedCustomer);
  });

  function computeWayPoints(from: ILatLng, to: ILatLng) {
    // TODO real route async
    // straight line
    return [
      {lat: from.lat, lng: from.lng},
      {lat: to.lat, lng: to.lng}
    ];
  }

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
      const distance = problem.distances[from.customer.id][to.customer.id];
      const travelTime = problem.travelTimes[from.customer.id][to.customer.id];
      to.distanceTo = distance;
      to.timeTo = travelTime;
      from.departureTime = to.arrivalTime - travelTime;
      to.wayPointsTo = computeWayPoints(from.customer, to.customer);
      truck.totalDistance += distance;
    }
  }

  return Promise.all(servedCustomers.filter((d) => d.wayPointsTo.length > 0).map(computeRouteWayPoints)).then(() => ({
    distance: solution.objective,
    finishTime,
    trucks
  }));
}

function computeRouteWayPoints(servedCustomer: IServedCustomer) {
  const line = servedCustomer.wayPointsTo;
  return computeRoute(line[0].lat, line[0].lng, line[1].lat, line[1].lng).then((wayPoints) => {
    servedCustomer.wayPointsTo = wayPoints.map((w) => ({lng: w[0], lat: w[1]}));
    return servedCustomer;
  });
}
