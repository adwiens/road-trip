import { Controller, Get } from '@nestjs/common';
import { SolverService } from './solver/solver.service';

@Controller()
export class AppController {
  constructor(private readonly solver: SolverService) {}

  @Get()
  async getSolve(): Promise<string> {
    return JSON.stringify(await this.solver.solve(53.54, 50.23, 113.41), undefined, 2);
  }
}
