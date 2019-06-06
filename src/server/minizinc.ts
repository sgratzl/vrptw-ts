import model from 'raw-loader!../model/model.mzn';
import RESTMiniZinc from 'minizinc/build/RESTMiniZinc';
import {IOrderConstraint, IServerSolution} from '../model/interfaces';
import {IDataObject} from 'minizinc';

const server = '/v1.0';

const client = new RESTMiniZinc(server);

export function buildOrderConstraint(customerIndexArray: IOrderConstraint[]) {
    return `
constraint forall (i, j in Customers) (
    if (${customerIndexArray.map(({from, to}) => `(i == ${from.id} /\\ j == ${to.id})`).join(` \\/ `)})
    then
        startOfService[i]+serviceTime[i] <= arrivalTime[j] /\\
        vehicleOf[i] == vehicleOf[j]
    else
        startOfService[i]+serviceTime[i] >= 0
    endif
)`;
}

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

export function solve(params: IDataObject, extraContraints: string[] = []): Promise<IServerSolution[]> {
  const fullModel = model + extraContraints.join('\n');

  return client.solve(fullModel, params).then((result) => {
    return result.solutions.map((s) => (<IServerSolution><unknown>s.assignments);
  }).catch((error) => {
    
  });
}
