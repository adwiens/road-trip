import * as glpkJs from 'glpk.js';
import { round } from 'lodash';

import {
  getMatrix,
  getSubjectTo,
  numEdges,
  solvePayments,
  toHumanReadable,
  zeros,
} from './solver';

describe('solver utils', () => {
  const matrix3 = [
    [-1, 1, -1, 1, 0, 0],
    [1, -1, 0, 0, -1, 1],
    [0, 0, 1, -1, 1, -1],
  ];
  const varNames3 = ['x_1_0', 'x_0_1', 'x_2_0', 'x_0_2', 'x_2_1', 'x_1_2'];

  describe('numEdges', () => {
    it('should return correct values', () => {
      expect(numEdges(1)).toBe(0);
      expect(numEdges(2)).toBe(2);
      expect(numEdges(3)).toBe(6);
      expect(numEdges(4)).toBe(12);
    });
  });

  describe('zeros', () => {
    it('should create an array of zeroes', () => {
      expect(zeros(3)).toEqual([0, 0, 0]);
    });
  });

  describe('getMatrix', () => {
    it('should create a correct matrix for 3 people', () => {
      const { matrix, varNames } = getMatrix([0, 0, 0]);
      expect(matrix).toEqual(matrix3);
      expect(varNames).toEqual(varNames3);
    });
  });

  describe('getSubjectTo', () => {
    it('should create a correct subjectTo object', async () => {
      const glpk = await glpkJs;
      const spent = [1, 2, 3];
      const obj = getSubjectTo(spent, matrix3, varNames3, glpk);
      expect(obj).toEqual([
        {
          name: 'person0',
          vars: [
            { name: 'x_1_0', coef: -1 },
            { name: 'x_0_1', coef: 1 },
            { name: 'x_2_0', coef: -1 },
            { name: 'x_0_2', coef: 1 },
            { name: 'x_2_1', coef: 0 },
            { name: 'x_1_2', coef: 0 },
          ],
          bnds: { type: 5, lb: 1 },
        },
        {
          name: 'person1',
          vars: [
            { name: 'x_1_0', coef: 1 },
            { name: 'x_0_1', coef: -1 },
            { name: 'x_2_0', coef: 0 },
            { name: 'x_0_2', coef: 0 },
            { name: 'x_2_1', coef: -1 },
            { name: 'x_1_2', coef: 1 },
          ],
          bnds: { type: 5, lb: 0 },
        },
        {
          name: 'person2',
          vars: [
            { name: 'x_1_0', coef: 0 },
            { name: 'x_0_1', coef: 0 },
            { name: 'x_2_0', coef: 1 },
            { name: 'x_0_2', coef: -1 },
            { name: 'x_2_1', coef: 1 },
            { name: 'x_1_2', coef: -1 },
          ],
          bnds: { type: 5, lb: -1 },
        },
        {
          name: 'edge0_nonnegative',
          vars: [
            { name: 'x_1_0', coef: 1 },
            { name: 'x_0_1', coef: 0 },
            { name: 'x_2_0', coef: 0 },
            { name: 'x_0_2', coef: 0 },
            { name: 'x_2_1', coef: 0 },
            { name: 'x_1_2', coef: 0 },
          ],
          bnds: { type: 2, lb: 0 },
        },
        {
          name: 'edge1_nonnegative',
          vars: [
            { name: 'x_1_0', coef: 0 },
            { name: 'x_0_1', coef: 1 },
            { name: 'x_2_0', coef: 0 },
            { name: 'x_0_2', coef: 0 },
            { name: 'x_2_1', coef: 0 },
            { name: 'x_1_2', coef: 0 },
          ],
          bnds: { type: 2, lb: 0 },
        },
        {
          name: 'edge2_nonnegative',
          vars: [
            { name: 'x_1_0', coef: 0 },
            { name: 'x_0_1', coef: 0 },
            { name: 'x_2_0', coef: 1 },
            { name: 'x_0_2', coef: 0 },
            { name: 'x_2_1', coef: 0 },
            { name: 'x_1_2', coef: 0 },
          ],
          bnds: { type: 2, lb: 0 },
        },
        {
          name: 'edge3_nonnegative',
          vars: [
            { name: 'x_1_0', coef: 0 },
            { name: 'x_0_1', coef: 0 },
            { name: 'x_2_0', coef: 0 },
            { name: 'x_0_2', coef: 1 },
            { name: 'x_2_1', coef: 0 },
            { name: 'x_1_2', coef: 0 },
          ],
          bnds: { type: 2, lb: 0 },
        },
        {
          name: 'edge4_nonnegative',
          vars: [
            { name: 'x_1_0', coef: 0 },
            { name: 'x_0_1', coef: 0 },
            { name: 'x_2_0', coef: 0 },
            { name: 'x_0_2', coef: 0 },
            { name: 'x_2_1', coef: 1 },
            { name: 'x_1_2', coef: 0 },
          ],
          bnds: { type: 2, lb: 0 },
        },
        {
          name: 'edge5_nonnegative',
          vars: [
            { name: 'x_1_0', coef: 0 },
            { name: 'x_0_1', coef: 0 },
            { name: 'x_2_0', coef: 0 },
            { name: 'x_0_2', coef: 0 },
            { name: 'x_2_1', coef: 0 },
            { name: 'x_1_2', coef: 1 },
          ],
          bnds: { type: 2, lb: 0 },
        },
      ]);
    });
  });

  describe('toHumanReadable', () => {
    it('should create correct object', () => {
      expect(toHumanReadable({ x_0_1: 2 })).toEqual([
        {
          from: 0,
          to: 1,
          amount: 2,
        },
      ]);
    });
  });

  describe('solvePayments', () => {
    it('should return [] if input is []', async () => {
      expect(await solvePayments([])).toEqual([]);
    });

    it('should solve the example scenario', async () => {
      const results = await solvePayments([53.54, 50.23, 113.41]);
      for (const result of results) {
        result.amount = round(result.amount, 2);
      }
      expect(results).toEqual([
        {
          from: 0,
          to: 2,
          amount: 18.85,
        },
        {
          from: 1,
          to: 2,
          amount: 22.16,
        },
      ]);
    });
  });
});
