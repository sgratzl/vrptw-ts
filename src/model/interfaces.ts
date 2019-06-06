export interface ILatLng {
  lat: number;
  lng: number;
}

export interface ICustomer extends ILatLng {
  id: number;
  name: string;

  demand: number;

  startTime: number;
  endTime: number;
  serviceTime: number;
}

export interface IDepot extends ICustomer {
  isDepot: true;
}

export interface ITruck {
  id: number;
  color: string;
  name: string;

  capacity: number;
}

export interface IServedCustomer {
  // customer to drive to or null to drive to depot
  customer: ICustomer | IDepot;
  arrivalTime: number;
  startOfService: number;
  endOfService: number;
  departureTime: number;
  // distance to this customer
  distanceTo: number;

  // way points to drive to this customer
  wayPointsTo: ILatLng[];
}

export interface ITruckRoute {
  truck: ITruck;

  usedCapacity: number;
  totalDistance: number;
  startTime: number;

  route: IServedCustomer[];
}

export interface ISolution {
  id: number;
  name: string;
  distance: number;

  violations: string[];

  trucks: ITruckRoute[];
}

export interface IProblem {
  trucks: ITruck[];
  customers: ICustomer[];
  depot: IDepot;
  distances: number[][];
  travelTimes: number[][];

  orderConstraints: {from: ICustomer, to: ICustomer}[];
}

export interface IServerSolution {
  objective: number;
  successor: number[];
  vehicleOf: number[];
  arrivalTime: number[];
  startOfService: number[];
}


export interface IOrderConstraint {
  from: ICustomer | IDepot;
  to: ICustomer | IDepot;
}

export function isDepot(customer: ICustomer | IDepot): customer is IDepot {
  return (<IDepot>customer).isDepot === true;
}
