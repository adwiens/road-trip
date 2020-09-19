import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { catchError, debounceTime, retry, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, EMPTY, Subscription } from 'rxjs';
import { values } from 'lodash-es';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { People, Person } from '@roadtrip/api-interfaces';

import { environment } from '../environments/environment';

const peopleUrl = `${environment.apiUrl}/people`;
const personUrl = (id: number) => `${peopleUrl}/${id}`;
const DEBOUNCE_TIME = 100;
const removeAt = (arr: any[], idx: number) => arr.filter((_, i) => i !== idx);

@Injectable({
  providedIn: 'root',
})
export class PeopleService implements OnDestroy {
  private _people = new BehaviorSubject(new FormArray([]));
  people = this._people.asObservable().pipe(debounceTime(DEBOUNCE_TIME)); // Expose as read-only

  private _idByIndex = new BehaviorSubject<number[]>([]);
  idByIndex$ = this._idByIndex.asObservable().pipe(debounceTime(DEBOUNCE_TIME)); // Expose read-only
  get idByIndex() {
    return this._idByIndex.value;
  }

  private subscriptions: Subscription[] = [];

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {
    this.loadPeople();
  }

  private addPersonToFormArray = ({ id, name }: Person) => {
    const formArray = this._people.value;
    const formGroup = new FormGroup({
      name: new FormControl(name, Validators.required),
    });
    this.subscriptions.push(this.subscribeValueChanges(formGroup, id));
    this._idByIndex.next([...this._idByIndex.value, id]);
    formArray.push(formGroup);
    this._people.next(formArray); // Emit to update component(s)
  };

  private refreshPeople = (peopleMap: People) => {
    this._people.next(new FormArray([]));
    this._idByIndex.next([]);
    values(peopleMap).forEach(this.addPersonToFormArray);
  };

  private subscribeValueChanges = (formGroup: FormGroup, id: number) => {
    return formGroup.valueChanges
      .pipe(
        debounceTime(DEBOUNCE_TIME),
        switchMap((value: Person) =>
          this.http.patch<Person>(personUrl(id), value).pipe(
            retry(3),
            catchError((e: Error) => {
              this.snackBar.open(`Error updating person (${e.name})`);
              console.error(e);
              return EMPTY;
            })
          )
        )
      )
      .subscribe();
  };

  async deletePerson(index: number) {
    try {
      await this.http
        .delete<void>(personUrl(this._idByIndex.value[index]))
        .pipe(retry(3))
        .toPromise();
      this.subscriptions[index].unsubscribe();
      this.subscriptions = removeAt(this.subscriptions, index);
      this._idByIndex.next(removeAt(this._idByIndex.value, index));
      const formArray = this._people.value;
      formArray.removeAt(index);
      this._people.next(formArray);
    } catch (e) {
      this.snackBar.open(`Error deleting person (${e.name})`);
      console.error(e);
    }
  }

  async addPerson() {
    try {
      const person = await this.http
        .post<Person>(peopleUrl, {})
        .pipe(retry(3))
        .toPromise();
      this.addPersonToFormArray(person);
    } catch (e) {
      this.snackBar.open(`Error adding person (${e.name})`);
      console.error(e);
    }
  }

  async loadPeople() {
    try {
      this._people.value.disable(); // Disable form controls while loading
      const people = await this.http
        .get<People>(peopleUrl)
        .pipe(retry(3))
        .toPromise();
      this.refreshPeople(people);
      this._people.value.enable();
    } catch (e) {
      this.snackBar.open(`Error loading people (${e.name})`);
      console.error(e);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
