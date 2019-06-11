import {truckColor} from '../constants';
import {IProblem} from './interfaces';
import smallProblem from './small';
import {IDataObject} from 'minizinc';

const problem: IProblem = {
  trucks: smallProblem.params.capacity.map((capacity, i) => ({
    id: i + 1,
    color: truckColor[i],
    name: `Electrican ${i + 1}`,
    capacity
  })),
  customers: smallProblem.params.demand.map((demand, i) => ({
    id: i + 1,
    name: smallProblem.name[i],
    lat: smallProblem.locationX[i],
    lng: smallProblem.locationY[i],
    demand,
    startTime: smallProblem.params.startTime[i],
    endTime: smallProblem.params.endTime[i],
    serviceTime: smallProblem.params.serviceTime[i],
  })),
  depot: {
    id: smallProblem.name.length - 1 + 1,
    isDepot: true,
    name: smallProblem.name[smallProblem.name.length - 1],
    lat: smallProblem.locationX[smallProblem.locationX.length - 1],
    lng: smallProblem.locationY[smallProblem.locationY.length - 1],
    demand: 0,
    startTime: NaN,
    endTime: NaN,
    serviceTime: 0
  },
  distances: smallProblem.params.distance,
  travelTimes: smallProblem.params.travelTime,

  lockedCustomers: [],
  lockedTrucks: [],
  partialOrderConstraints: []
};

export default problem;


export function problem2params(problem: IProblem): IDataObject {
  return {
    nVehicles: problem.trucks.length,
    capacity: problem.trucks.map((t) => t.capacity),
    demand: problem.customers.map((c) => c.demand),
    travelTime: problem.travelTimes,
    distance: problem.distances,
    startTime: problem.customers.map((c) => c.startTime),
    endTime: problem.customers.map((c) => c.endTime),
    serviceTime: problem.customers.map((c) => c.serviceTime),
  };
}
