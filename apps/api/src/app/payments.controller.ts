import { Controller, Get } from '@nestjs/common';
import { groupBy, sum, values } from 'lodash';

import { Payment } from '@roadtrip/api-interfaces';

import { ExpensesService } from './expenses.service';
import { solvePayments } from './solver';
import { PeopleService } from './people.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private expensesService: ExpensesService,
    private peopleService: PeopleService
  ) {}

  @Get()
  async getPayments(): Promise<Payment[]> {
    const people = values(this.peopleService.findAll());
    const expenses = groupBy(this.expensesService.findAll(), 'personId');
    const totalSpent = people.map(({ id }) =>
      sum(expenses[id].map(({ amount }) => amount))
    );
    const payments = await solvePayments(totalSpent);
    const paymentsByName = payments.map((transfer) => ({
      ...transfer,
      from: people[+transfer.from].name || 'unnamed', // Return names
      to: people[+transfer.to].name || 'unnamed',
    }));
    return paymentsByName;
  }
}
