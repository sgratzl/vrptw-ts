import {IOrderConstraint, IConstraints} from './interfaces';
import model from 'raw-loader!../model/model.mzn';

export const MODEL = model;

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


export function constraints2code(constraints: IConstraints) {
  // TODO so far just support for partial order ones
  return buildOrderConstraint(constraints.partialOrderConstraints);
}

