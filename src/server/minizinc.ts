
// export function constraintsViolationCheckArrival(problem, previousCustomer, currentCustomer) {
//     const numLocations = problem.locationX.length;
//     const travelTime = problem.params.travelTime;

//     let violated = false;

//     let travelTimeInBetween;
//     if (previousCustomer.customer >= numLocations && currentCustomer.customer >= numLocations)
//       travelTimeInBetween = 0;
//     else if (previousCustomer.customer >= numLocations && currentCustomer.customer < numLocations)
//       travelTimeInBetween = travelTime[numLocations-1][currentCustomer.customer-1];
//     else if (previousCustomer.customer < numLocations && currentCustomer.customer >= numLocations)
//       travelTimeInBetween = travelTime[previousCustomer.customer-1][numLocations-1];
//     else
//       travelTimeInBetween = travelTime[previousCustomer.customer-1][currentCustomer.customer-1];
//     // console.log(travelTimeInBetween);

//     let currentCustomerNewArrivalTime = previousCustomer.startServiceTime + previousCustomer.serviceTime + travelTimeInBetween;
//     if (currentCustomerNewArrivalTime > currentCustomer.endTime) violated = true;

//     return violated;
//   }
