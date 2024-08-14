import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { FirestoreService } from '../services/firestore.service';
import { userActions } from '../store/action'
import { transactionInterface, transactionCategory, transactionMode, transactionType } from '../store/type/transaction.interface';
import { Router } from '@angular/router';
import { initalUserStateInterface } from '../store/type/InitialUserState.interface';
import { ToastController } from '@ionic/angular';
import { TransactionService } from '../services/transaction.service';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class Tab1Page implements OnInit {

  user!: initalUserStateInterface;
  transactionId: string = '';
  profileModelFlag = false;
  account: any = { month: 0, savings: 0, totalCredit: 0, totalSpent: 0, transactions: [], year: 2024 };
  newDate = new Date();
  transactionType = transactionType;
  transactionCategory = transactionCategory;
  transactionMode = transactionMode;
  transactions: any;
  foodSpentAmount: number = 0;
  shoppingSpentAmount: number = 0;
  medicalSpentAmount: number = 0;
  travelSpentAmount: number = 0;
  otherSpentAmount: number = 0;
  foodCreditAmount: number = 0;
  shoppingCreditAmount: number = 0;
  medicalCreditAmount: number = 0;
  travelCreditAmount: number = 0;
  otherCreditAmount: number = 0;

  constructor(private toastController: ToastController, private store: Store<{ user: initalUserStateInterface }>, private firestoreService: FirestoreService, private router: Router, private transactionService: TransactionService) { }

  async ngOnInit() {
    this.store.select('user').subscribe(async (data: any) => {
      localStorage.setItem('user', JSON.stringify(data));
      this.user = data;
      [this.account] = data.accounts.filter((acc: any) => acc.month === this.newDate.getMonth() + 1 && acc.year === this.newDate.getFullYear());
      this.transactions = [...this.account.transactions] as any[];
      this.initializeData();
      await this.firestoreService.updateDoc(data!.Uid!, data);
    });

  }

  setProfileModelFlag(flag: boolean) {
    this.profileModelFlag = flag;
  }

  calculateQuota() {
    let date = new Date();
    let totalDays = new Date(date.getUTCFullYear(), date.getUTCMonth() + 1, 0).getDate();
    let remainingDays = date.getDate();
    let quota = Math.trunc((this.foodCreditAmount - this.foodSpentAmount) / ((totalDays - remainingDays) + 1));
    let totalquota = Math.trunc((this.foodCreditAmount - this.foodSpentAmount) / totalDays);
    return quota + " / " + totalquota;
  }

  initializeData() {
    this.foodSpentAmount = 0;
    this.shoppingSpentAmount = 0;
    this.travelSpentAmount = 0;
    this.medicalSpentAmount = 0;
    this.otherSpentAmount = 0;
    this.foodCreditAmount = 0;
    this.shoppingCreditAmount = 0;
    this.travelCreditAmount = 0;
    this.medicalCreditAmount = 0;
    this.otherCreditAmount = 0;
    this.account.transactions?.forEach((data: any) => {
      if (data.type === transactionType.Debit) {
        switch (data.category) {
          case 0:
            this.foodSpentAmount = this.foodSpentAmount + data.amount!;
            break;
          case 1:
            this.shoppingSpentAmount = this.shoppingSpentAmount + data.amount!;
            break;
          case 2:
            this.travelSpentAmount = this.travelSpentAmount + data.amount!;
            break;
          case 3:
            this.medicalSpentAmount = this.medicalSpentAmount + data.amount!;
            break;
          case 4:
            this.otherSpentAmount = this.otherSpentAmount + data.amount!;
            break;
          default:
            break;
        }
      } else if (data.type === transactionType.Credit) {
        switch (data.category) {
          case 0:
            this.foodCreditAmount = this.foodCreditAmount + data.amount!;
            break;
          case 1:
            this.shoppingCreditAmount = this.shoppingCreditAmount + data.amount!;
            break;
          case 2:
            this.travelCreditAmount = this.travelCreditAmount + data.amount!;
            break;
          case 3:
            this.medicalCreditAmount = this.medicalCreditAmount + data.amount!;
            break;
          case 4:
            this.otherCreditAmount = this.otherCreditAmount + data.amount!;
            break;
          default:
            break;
        }
      }
    });
  }

  async deleteTransaction(id: string, seconds: number) {
    let date = new Date(seconds);
    await this.store.dispatch(userActions.deleteTransaction({ transactionId: id, month: date.getMonth() + 1, year: date.getFullYear() }));
    this.transactionService.presentToast("Transaction deleted successfully");
    this.initializeData();
  }

  async updateTransaction(trans: any) {
    this.transactionService.transaction.next(trans);
    this.router.navigate(['tabs', 'addtransaction']);
  }

}
