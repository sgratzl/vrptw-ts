import {IOrderConstraint} from './interfaces';

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
