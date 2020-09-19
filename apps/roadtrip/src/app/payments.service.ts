import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { retry } from 'rxjs/operators';

import { Payment } from '@roadtrip/api-interfaces';

import { environment } from '../environments/environment';

const paymentsUrl = `${environment.apiUrl}/payments`;

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  async getPayments(): Promise<Payment[]> {
    try {
      return await this.http
        .get<Payment[]>(paymentsUrl)
        .pipe(retry(3))
        .toPromise();
    } catch (e) {
      this.snackBar.open(`Error getting payments (${e.name})`);
      console.error(e);
    }
    return [];
  }
}
