import { Injectable } from '@nestjs/common';
import { isNumber, isString, values } from 'lodash';

import { Expense, Expenses } from '@roadtrip/api-interfaces';

@Injectable()
export class ExpensesService {
  // Initialize to the given example:
  private idCounter = 10;
  private expenses: Expenses = {
    0: { id: 0, personId: 0, description: 'Expense 1', amount: 5.75 },
    1: { id: 1, personId: 0, description: 'Expense 2', amount: 35 },
    2: { id: 2, personId: 0, description: 'Expense 3', amount: 12.79 },
    3: { id: 3, personId: 1, description: 'Expense 4', amount: 12 },
    4: { id: 4, personId: 1, description: 'Expense 5', amount: 15 },
    5: { id: 5, personId: 1, description: 'Expense 6', amount: 23.23 },
    6: { id: 6, personId: 2, description: 'Expense 7', amount: 10 },
    7: { id: 7, personId: 2, description: 'Expense 8', amount: 20 },
    8: { id: 8, personId: 2, description: 'Expense 9', amount: 38.41 },
    9: { id: 9, personId: 2, description: 'Expense 10', amount: 45 },
  };

  private getExpense(id: number): Expense {
    if (isNaN(id)) {
      throw Error('Provided ID is not a number');
    }
    const expense = this.expenses[id];
    if (!expense) {
      throw Error(`Expense ${id} not found`);
    }
    return expense;
  }

  create(expense: Expense): Expense {
    expense.id = this.idCounter++;
    if (!isNumber(expense.amount)) {
      expense.amount = 0;
    }
    if (!isString(expense.description)) {
      expense.description = '';
    }
    this.expenses[expense.id] = expense;
    return expense;
  }

  findAll(): Expense[] {
    return values(this.expenses);
  }

  remove(id: number): void {
    this.getExpense(id); // Throws if it can't be found
    delete this.expenses[id];
  }

  update(id: number, amount: number) {
    const expense = this.getExpense(id);
    const mergedExpense: Expense = {
      ...expense,
      amount
    };
    this.expenses[id] = mergedExpense;
    return mergedExpense;
  }
}