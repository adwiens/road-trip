import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { catchError, debounceTime, retry, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, EMPTY, Subscription } from 'rxjs';
import { groupBy, toPairs, values } from 'lodash-es';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { Expenses, Expense } from '@roadtrip/api-interfaces';

import { environment } from '../environments/environment';

const expensesUrl = `${environment.apiUrl}/expenses`;
const expenseUrl = (id: number) => `${expensesUrl}/${id}`;
const DEBOUNCE_TIME = 100;
const removeAt = (arr: any[], idx: number) => arr.filter((_, i) => i !== idx);

@Injectable({
  providedIn: 'root',
})
export class ExpensesService implements OnDestroy {
  private _expenses = new BehaviorSubject<Record<number, FormArray>>({});
  expenses = this._expenses.asObservable().pipe(debounceTime(DEBOUNCE_TIME)); // Expose as read-only

  private idsByPersonId: number[][] = [];
  private subscriptions: Record<number, Subscription> = {};

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {
    this.loadExpenses();
  }

  private addExpenseToFormArray = ({
    id,
    amount,
    description,
    personId,
  }: Expense) => {
    const formArray = this._expenses.value[personId] ?? new FormArray([]);
    const formGroup = new FormGroup({
      amount: new FormControl(amount),
      description: new FormControl(description),
    });
    this.subscriptions[id] = this.subscribeValueChanges(formGroup, id);
    if (!this.idsByPersonId[personId]) {
      this.idsByPersonId[personId] = [];
    }
    console.log(this.idsByPersonId[personId]);
    this.idsByPersonId[personId].push(id);
    formArray.push(formGroup);
    this._expenses.next({ ...this._expenses.value, [personId]: formArray });
  };

  private refreshExpenses = (expensesMap: Expenses) => {
    const expensesByPersonId = groupBy(values(expensesMap), 'personId');
    for (const [personId, expenses] of toPairs(expensesByPersonId)) {
      this._expenses.next({
        ...this._expenses.value,
        [+personId]: new FormArray([]),
      });
      this.idsByPersonId[+personId] = [];
      expenses.forEach(this.addExpenseToFormArray);
    }
  };

  private subscribeValueChanges = (formGroup: FormGroup, id: number) => {
    return formGroup.valueChanges
      .pipe(
        debounceTime(DEBOUNCE_TIME),
        switchMap((value: Expense) =>
          this.http.patch<Expense>(expenseUrl(id), value).pipe(
            retry(3),
            catchError((e: Error) => {
              this.snackBar.open(`Error updating expense (${e.name})`);
              console.error(e);
              return EMPTY;
            })
          )
        )
      )
      .subscribe();
  };

  async deleteExpense(personId: number, index: number) {
    try {
      const id = this.idsByPersonId[personId][index];
      await this.http.delete<void>(expenseUrl(id)).pipe(retry(3)).toPromise();
      this.subscriptions[id].unsubscribe();
      delete this.subscriptions[id];
      this.idsByPersonId[personId] = removeAt(
        this.idsByPersonId[personId],
        index
      );
      const formArray = this._expenses.value[personId];
      formArray.removeAt(index);
      this._expenses.next(this._expenses.value); // Emit to update component(s)
    } catch (e) {
      this.snackBar.open(`Error deleting expense (${e.name})`);
      console.error(e);
    }
  }

  async addExpense(personId: number) {
    try {
      const expense = await this.http
        .post<Expense>(expensesUrl, { personId })
        .pipe(retry(3))
        .toPromise();
      this.addExpenseToFormArray(expense);
    } catch (e) {
      this.snackBar.open(`Error adding expense (${e.name})`);
      console.error(e);
    }
  }

  async loadExpenses() {
    try {
      values(this.subscriptions).forEach((sub) => sub.unsubscribe());
      this.subscriptions = {};
      this._expenses.next({});
      const expenses = await this.http
        .get<Expenses>(expensesUrl)
        .pipe(retry(3))
        .toPromise();
      this.refreshExpenses(expenses);
    } catch (e) {
      this.snackBar.open(`Error loading expenses (${e.name})`);
      console.error(e);
    }
  }

  ngOnDestroy() {
    values(this.subscriptions).forEach((s) => s.unsubscribe());
  }
}
