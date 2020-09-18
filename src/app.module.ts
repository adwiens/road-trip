import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SolverService } from './solver/solver.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [SolverService],
})
export class AppModule {}
