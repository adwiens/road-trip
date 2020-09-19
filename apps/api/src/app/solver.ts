import { range, mean, toPairs, isEmpty } from 'lodash';
import * as glpkJs from 'glpk.js'; // XXX: glpk.js does not have types.

import { Payment } from '@roadtrip/api-interfaces';

/**
 * Get number of edges in a complete bidirectional graph.
 *
 * @param nodes Number of nodes in the graph.
 */
export const numEdges = (nodes: number) => nodes * (nodes - 1);

/**
 * Get an array of zeros.
 *
 * @param length Length of the array.
 */
export const zeros = (length: number) => range(length).map((_) => 0);

/**
 * Get the "A" matrix for solving equation Ax = c.
 *
 * @param totalSpent The total amount each person spent on the trip.
 */
export function getMatrix(
  totalSpent: number[]
): { matrix: number[][]; varNames: string[] } {
  const numPeople = totalSpent.length;
  const people = range(numPeople);
  const edges = zeros(numEdges(numPeople)); // Two edges per pair of people
  const matrix = people.map((_) => [...edges]); // The "A" matrix
  const varNames = edges.map((_) => ''); // The "x" variables
  // Create the "A" matrix to solve for equation Ax = c:
  let colIdx = 0;
  for (const person of people) {
    const otherPeople = range(person);
    for (const otherPerson of otherPeople) {
      // This 2-step loop is inline for readability:
      // Money exchanged from person to otherPerson:
      matrix[person][colIdx] = 1;
      matrix[otherPerson][colIdx] = -1;
      varNames[colIdx] = `x_${person}_${otherPerson}`; // Format: "x_from_to"
      colIdx++;
      // Money exchanged from otherPerson to person:
      matrix[person][colIdx] = -1;
      matrix[otherPerson][colIdx] = 1;
      varNames[colIdx] = `x_${otherPerson}_${person}`; // Format: "x_from_to"
      colIdx++;
    }
  }
  return { matrix, varNames };
}

/**
 * Get the "subjectTo" constraints for the glpk.js solver.
 *
 * @param totalSpent Total amount each person spent.
 * @param matrix "A" matrix to solve for equation Ax = c.
 * @param varNames The name of each "x" variable.
 * @param glpk The linear programming solver.
 */
export function getSubjectTo(
  totalSpent: number[],
  matrix: number[][],
  varNames: string[],
  glpk: any
) {
  // Use "A" matrix to create "subjectTo" array for glpk.js solver:
  const avg = mean(totalSpent);
  const subjectTo = matrix.map((cols: number[], person: number) => ({
    name: `person${person}`,
    vars: cols.map((coef: number, columnIdx: number) => ({
      name: varNames[columnIdx],
      coef,
    })),
    // Everyone should spend the same net amount:
    bnds: { type: glpk.GLP_FX, lb: avg - totalSpent[person] },
  }));
  // Constrain that edges must be nonnegative:
  subjectTo.push(
    ...matrix[0].map((_, edgeIdx) => ({
      name: `edge${edgeIdx}_nonnegative`,
      vars: subjectTo[0].vars.map(({ name }, varIdx) => ({
        name,
        coef: varIdx === edgeIdx ? 1 : 0,
      })),
      bnds: { type: glpk.GLP_LO, lb: 0 },
    }))
  );
  return subjectTo;
}

/**
 * Get a human-readable representation of the solver's results.
 *
 * @param result The raw variables from the solver.
 */
export function toHumanReadable(
  result: Record<string, number>
): Payment[] {
  // Get only the edges that are nonzero, i.e. where money changes hands:
  const nonZero = toPairs(result).filter(([, amount]) => amount > 0);
  // Return in a human-readable form:
  return nonZero.map(([k, amount]: [string, number]) => {
    const [_, from, to] = k.split('_');
    return { from, to, amount };
  });
}

/**
 * Solve linear program for who should give how much money to who.
 *
 * @param totalSpent The amount each person spent on the trip.
 */
export async function solvePayments(
  totalSpent: number[]
): Promise<Payment[]> {
  if (isEmpty(totalSpent)) {
    return [];
  }
  const glpk: any = await glpkJs;
  const { matrix, varNames } = getMatrix(totalSpent);
  const subjectTo = getSubjectTo(totalSpent, matrix, varNames, glpk);
  const lp = {
    name: 'tripExpenseLinearProgram',
    objective: {
      // Minimize the sum of the amount of money exchanged:
      direction: glpk.GLP_MIN,
      name: 'totalExchanged',
      vars: varNames.map((name) => ({ name, coef: 1 })),
    },
    subjectTo,
  };
  const result = glpk.solve(lp, glpk.GLP_MSG_OFF).result.vars;
  return toHumanReadable(result);
}
