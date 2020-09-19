import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { Expense } from '@roadtrip/api-interfaces';

import { ExpensesService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post()
  create(@Body() expense: Expense): Expense {
    return this.expensesService.create(expense);
  }

  @Get()
  findAll(): Expense[] {
    return this.expensesService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string): void {
    this.expensesService.remove(+id);
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() expense: Expense) {
    return this.expensesService.update(+id, expense.amount);
  }
}