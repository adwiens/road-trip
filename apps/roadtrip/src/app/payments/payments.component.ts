import { Component } from '@angular/core';
import { ReplaySubject } from 'rxjs';

import { Payment } from '@roadtrip/api-interfaces';

import { PaymentsService } from '../payments.service';

@Component({
  selector: 'rt-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent {
  payments = new ReplaySubject<Payment[]>();

  constructor(private paymentsService: PaymentsService) {}

  async getPayments() {
    this.payments.next(await this.paymentsService.getPayments());
  }
}
