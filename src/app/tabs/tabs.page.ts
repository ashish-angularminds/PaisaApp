import { Component } from '@angular/core';
import { TransactionService } from '../services/transaction.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(private transactionService: TransactionService) { }

  setEmptyTransaction() {
    setTimeout(() => {
      this.transactionService.transaction.next({});
    }, 400);
  }
}
