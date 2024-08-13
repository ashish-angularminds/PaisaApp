import { Injectable } from '@angular/core';
import { BehaviorSubject, skip } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor() { }

  transaction = new BehaviorSubject({});
}
