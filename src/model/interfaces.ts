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
  customer: ICustomer | IDepot;
  arrivalTime: number;
  startOfService: number;
  endOfService: number;
  departureTime: number;
  // distance to this customer
  distanceTo: number;
  timeTo: number;

  // way points to drive to this customer
  wayPointsTo: ILatLng[];
}

export interface ITruckRoute {
  truck: ITruck;

  usedCapacity: number;
  totalDistance: number;
  startTime: number;
  finishTime: number;

  route: IServedCustomer[];
}


export interface IConstraints {
  partialOrderConstraints: IOrderConstraint[];
  lockedCustomers: ILockedCustomerConstraint[];
  lockedTrucks: ILockedTruckConstraint[];
}

export interface IProblem {
  trucks: ITruck[];
  customers: ICustomer[];
  depot: IDepot;
  distances: number[][];
  travelTimes: number[][];
  constraints: IConstraints;
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

export interface ILockedCustomerConstraint {
  customer: ICustomer;
  truck: ITruck;
}

export interface ILockedTruckConstraint {
  truck: ITruck;
  customers: (ICustomer | IDepot)[];
}

export interface ISolution {
  // solution
  distance: number;

  finishTime: number;
  trucks: ITruckRoute[];
}

export function isDepot(customer: ICustomer | IDepot): customer is IDepot {
  return (<IDepot>customer).isDepot === true;
}
