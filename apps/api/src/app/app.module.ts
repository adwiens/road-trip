import { Module } from '@nestjs/common';

import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [],
  controllers: [PeopleController, ExpensesController, PaymentsController],
  providers: [PeopleService, ExpensesService],
})
export class AppModule {}
