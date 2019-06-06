/*
Vehicle Routing Problem with Time Windows
*/

%%%%%%%%%%%%%%
% Parameters %
%%%%%%%%%%%%%%

% Number of vehicles
int: nVehicles;
set of int: Vehicles = 1..nVehicles;

% Distance between each pair of locations
% The depot is the final location
array[int,int] of int: distance;

% Travel time between each pair of locations
array[int,int] of int: travelTime;

int: nCustomers = length(index_set_1of2(distance))-1;
set of int: Customers = 1..nCustomers;

% Capacity of each vehicle
array[Vehicles] of int: capacity;

% Demand of each customer
array[Customers] of int: demand;

% Start of time window of each customer
array[Customers] of int: startTime;
% End of time window of each customer
array[Customers] of int: endTime;
% Service time of each customer
array[Customers] of int: serviceTime;

set of int: Locations = 1..nCustomers+2*nVehicles;

% Internal distance and time matrix
% For each vehicle, introduce one start and one end location for the depot
array[Locations,Locations] of int: dm = array2d(Locations,Locations,
[ distance[ min(i, nCustomers+1), min(j, nCustomers+1) ] | i,j in Locations ]);

array[Locations,Locations] of int: tm = array2d(Locations,Locations,
[ travelTime[ min(i, nCustomers+1), min(j, nCustomers+1) ] | i,j in Locations ]);

%%%%%%%%%%%%%%%%
% Decision variables %
%%%%%%%%%%%%%%%%

% The successor of each location in the "grand tour"
array[Locations] of var Locations: successor;

% The vehicle each location gets assigned to
array[Locations] of var Vehicles: vehicleOf;

% The arrival time at each customer
array[Locations] of var 0..infinity: arrivalTime;
% The start of service at each customer
array[Locations] of var 0..infinity: startOfService;

% The objective function
var int: objective;

%%%%%%%%%%%
% Constraints %
%%%%%%%%%%%

include "circuit.mzn";
include "bin_packing_capa.mzn";

% All successors from one "grand tour"
constraint circuit(successor);
% Set up links between depot nodes
constraint forall (i in 1..nVehicles) (
successor[nCustomers+nVehicles+i] = nCustomers+1+(i mod nVehicles)
);

% Set up vehicle number for each location
constraint forall (i in 1..nVehicles) (
vehicleOf[nCustomers+i] = i /\
vehicleOf[nCustomers+nVehicles+i] = i
);

% Each successor is on the same vehicle
constraint forall (i in 1..nCustomers+nVehicles) (
vehicleOf[i] = vehicleOf[successor[i]]
);

% The capacity of each vehicle must not be exceeded
constraint bin_packing_capa(capacity, [ vehicleOf[i] | i in Customers ], demand);

% All vehicles start at time 0
constraint forall (i in Vehicles) (
arrivalTime[nCustomers+i] = 0 /\
startOfService[nCustomers+i] = 0 /\
arrivalTime[successor[nCustomers+i]] = tm[nCustomers+i,successor[nCustomers+i]]
);

% Each customer must be visited within their time window
constraint forall (c in Customers) (
startOfService[c] >= startTime[c] /\
startOfService[c] <= endTime[c] /\
arrivalTime[c] <= startOfService[c] /\
arrivalTime[successor[c]] = startOfService[c]+serviceTime[c]+tm[c,successor[c]]
);


% Objective: reduce overall travel distance
constraint objective = sum (i in Locations) (dm[i, successor[i]]);


% solve
ann: is = int_search(successor, afc_size_max, indomain_min, complete);
include "gecode.mzn";
ann: lns = relax_and_reconstruct(successor, 85);

solve ::is ::lns minimize objective;

output outputJSON();