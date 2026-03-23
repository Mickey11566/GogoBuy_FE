import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class LinePayService {
  constructor(
    private http: HttpClient,
    private https: HttpService
  ) { }

  requestPayment(eventId: number, userId?: string): Observable<string> {
    const url = userId
      ? `${this.https.BASE_URL}/api/payments/linepay/request/pay?eventId=${eventId}&userId=${userId}`
      : `${this.https.BASE_URL}/api/payments/linepay/request/pay?eventId=${eventId}`;
    return this.http.post(url, {}, { responseType: 'text' });
  }

  confirmPayment(transactionId: string, amount: number): Observable<string> {
    return this.http.get(`${this.https.BASE_URL}/api/payments/linepay/confirm?transactionId=${transactionId}&amount=${amount}`, { responseType: 'text' });
  }
}
