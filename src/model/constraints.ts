import {IOrderConstraint} from './interfaces';

export function buildOrderConstraint(constraints: IOrderConstraint[]) {
  if (constraints.length === 0) {
    return '';
  }

  return `
constraint forall (i, j in Customers) (
  if (${constraints.map(({from, to}) => `(i == ${from.id} /\\ j == ${to.id})`).join(` \\/ `)})
  then
      startOfService[i]+serviceTime[i] <= arrivalTime[j] /\\
      vehicleOf[i] == vehicleOf[j]
  else
      startOfService[i]+serviceTime[i] >= 0
  endif
)`;
}
