import { Component } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { FormArray } from '@angular/forms';
import { map } from 'rxjs/operators';
import { invert, mapKeys } from 'lodash-es';

import { PeopleService } from '../people.service';
import { ExpensesService } from '../expenses.service';

@Component({
  selector: 'rt-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent {
  people: Observable<FormArray>;
  expenses: Observable<Record<number, FormArray>>;

  constructor(
    private peopleService: PeopleService,
    private expensesService: ExpensesService
  ) {
    this.people = peopleService.people;
    const indexByPersonId$ = peopleService.idByIndex$.pipe(
      // XXX: "as any" because lodash assumes keys are strings
      map(
        (idByIndex: Record<number, number>) =>
          (invert(idByIndex) as any) as Record<number, number>
      )
    );
    this.expenses = combineLatest([
      expensesService.expenses,
      indexByPersonId$,
    ]).pipe(
      map(([expensesByPersonId, indexByPersonId]) =>
        mapKeys(expensesByPersonId, (_value, key) => indexByPersonId[+key])
      ),
    );
  }

  private getPersonId(personIdx: number) {
    return this.peopleService.idByIndex[personIdx];
  }

  deletePerson(index: number) {
    this.peopleService.deletePerson(index);
  }

  addPerson() {
    this.peopleService.addPerson();
  }

  refresh() {
    this.peopleService.loadPeople();
    this.expensesService.loadExpenses();
  }

  addExpense(personIdx: number) {
    this.expensesService.addExpense(this.getPersonId(personIdx));
  }

  deleteExpense(personIdx: number, index: number) {
    this.expensesService.deleteExpense(this.getPersonId(personIdx), index);
  }
}
