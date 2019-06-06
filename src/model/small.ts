import {distance, travelTime} from './common';

const smallProblem = {
    params: {
        nVehicles: 3,
        // per vehicle
        capacity: [1000, 1000, 1000],
        // from (customer+depot) i to (customer+depot) j
        distance,
        // from (customer+depot) i to (customer+depot) j
        travelTime,
        // needed capacity per customer
        demand: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // start time window when customer i is ready
        startTime: [25, 60, 45, 100, 70, 130, 65, 65, 30, 30, 45, 120],
        // end time window when customer has to be served
        endTime: [75, 140, 100, 165, 130, 170, 105, 125, 105, 50, 70, 150],
        // time to spent at customer
        serviceTime: [20, 40, 35, 35, 50, 30, 24, 50, 30, 30, 25, 30],
    },
    locationX: [-37.9032, -37.9347, -37.8924, -37.9130, -37.8910, -37.8964, -37.9000, -37.9247, -37.9300, -37.9403, -37.8960, -37.9135, -37.9095],
    locationY: [145.1580, 145.1270, 145.1442, 145.1480, 145.1260, 145.1692, 145.1133, 145.1196, 145.1565, 145.1480, 145.1480, 145.1285, 145.1362],
    // 12 customers + 1 depot
    name: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'X', 'Y', 'Z', 'O']
};

export default smallProblem;
