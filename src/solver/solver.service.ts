import { Injectable } from '@nestjs/common';

import * as glpkJs from 'glpk.js';

@Injectable()
export class SolverService {
  async solve(c1: number, c2: number, c3: number) {
    const avg = (c1 + c2 + c3) / 3;
    const glpk: any = await glpkJs;
    const lp = {
      name: 'LP',
      objective: {
        direction: glpk.GLP_MIN,
        name: 'obj',
        vars: [
          { name: 'x1', coef: 1 },
          { name: 'x2', coef: 1 },
          { name: 'x3', coef: 1 }
        ]
      },
      subjectTo: [
        {
          name: 'cons1',
          vars: [
            { name: 'x1', coef: -1 },
            { name: 'x2', coef: 0 },
            { name: 'x3', coef: 1 },
          ],
          bnds: { type: glpk.GLP_UP, ub:  avg - c1, lb: avg - c1 }
        },
        {
          name: 'cons1',
          vars: [
            { name: 'x1', coef: 1 },
            { name: 'x2', coef: -1 },
            { name: 'x3', coef: 0 },
          ],
          bnds: { type: glpk.GLP_UP, ub:  avg - c2, lb: avg - c2 }
        },
        {
          name: 'cons1',
          vars: [
            { name: 'x1', coef: 0 },
            { name: 'x2', coef: 1 },
            { name: 'x3', coef: -1 },
          ],
          bnds: { type: glpk.GLP_UP, ub:  avg - c3, lb: avg - c3 }
        },
      ]
    };
   
    return glpk.solve(lp, glpk.GLP_MSG_ALL)
  }
}
