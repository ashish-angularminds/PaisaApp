import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { addDoc, collection, Firestore, updateDoc, doc } from '@angular/fire/firestore';
import { FirestoreService } from '../services/firestore.service';
import { userActions } from '../store/action'
import { transactionInterface, transactionCategory, transactionMode, transactionType } from '../store/type/transaction.interface';
import { Router } from '@angular/router';
import { initalUserStateInterface } from '../store/type/InitialUserState.interface';
import { ToastController } from '@ionic/angular';
import { IonModal } from '@ionic/angular/common';
import { accounts } from '../store/type/account.interface';
import { v4 as uuidv4 } from 'uuid';
import { selectAccounts, selectLastSMSUpdate, selectUid } from '../store/selectors'
import { TransactionService } from '../services/transaction.service';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  user!: initalUserStateInterface;
  transactionId: string = '';
  addTransactionModelFlag = false;
  profileModelFlag = false;
  smsTransactionListModelFlag: boolean = false;
  account!: accounts;
  newDate = new Date();
  newDateEpoch = Date.now() / 1000;
  transactionType = transactionType;
  transactionCategory = transactionCategory;
  transactionMode = transactionMode;
  transaction!: transactionInterface;
  formCreatedAt!: any;
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

  constructor(private toastController: ToastController, private store: Store<{ user: initalUserStateInterface }>, private firestore: Firestore, private firestoreService: FirestoreService, private router: Router, private transactionService: TransactionService) { }

  ngOnInit() {
    this.getAccount();
    if (!this.account) {
      let oldMonth = this.newDate.getMonth() === 0 ? 12 : this.newDate.getMonth();
      let oldYear = oldMonth === 12 ? this.newDate.getFullYear() - 1 : this.newDate.getFullYear();
      let updatedAccounts = this.user.accounts.map((acc) => {
        if (acc.month === oldMonth && acc.year === oldYear) {
          return { ...acc, savings: acc.totalCredit! - acc.totalSpent! }
        } else {
          return acc;
        }
      });
      this.store.dispatch(userActions.updateAccount({ accounts: updatedAccounts }));
      this.store.dispatch(userActions.createAccount({ account: { month: this.newDate.getMonth() + 1, year: this.newDate.getFullYear(), savings: 0, totalCredit: 0, totalSpent: 0, transactions: [] } }));
      this.updateFirestoreDoc();
    }
    this.initializeData();
  }

  dateConverter(date: any) {
    return (new Date(date.seconds * 1000).toLocaleDateString()) + " - " + (new Date(date.seconds * 1000).toLocaleTimeString('en-US'));
  }

  getTransactionCategory(data: any) {
    switch (data) {
      case 0:
        return "Food";
      case 1:
        return "Shopping";
      case 2:
        return "Travel";
      case 3:
        return "Medical";
      case 4:
        return "Other";
      default:
        return "";
    }
  }

  getTransactionType(data: any) {
    switch (data) {
      case 0:
        return "Credit";
      case 1:
        return "Debit";
      default:
        return "";
    }
  }

  getTransactionMode(data: any) {
    switch (data) {
      case 0:
        return "Cash";
      case 1:
        return "UPI";
      case 2:
        return "Card";
      default:
        return "";
    }
  }

  reverseList(list: transactionInterface[]) {
    let tmpList = [...list];
    return tmpList.sort((a: any, b: any) => {
      const aDate: any = new Date(b?.createdAt?.seconds * 1000);
      const bDate: any = new Date(a?.createdAt?.seconds * 1000);
      return aDate - bDate;
    });
  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'bottom',
    });
    await toast.present();
  }

  setSMSTransactionListModelFlag(flag: boolean) {
    this.smsTransactionListModelFlag = flag;
  }

  setProfileModelFlag(flag: boolean) {
    this.profileModelFlag = flag;
  }

  setAddTransactionModelFlag(flag: boolean, trans?: transactionInterface) {
    if (trans) {
      this.transaction = { ...trans };
      this.formCreatedAt = new Date(trans.createdAt?.seconds! * 1000).toISOString();
      this.addTransactionModelFlag = flag;
    } else {
      this.transaction = {
        amount: undefined,
        category: undefined,
        type: undefined,
        mode: undefined,
        merchant: undefined,
        account: undefined,
        id: undefined
      }
      this.formCreatedAt = new Date().toISOString();
      this.addTransactionModelFlag = flag;
    }
  }

  calculateQuota() {
    let date = new Date();
    let totalDays = new Date(date.getUTCFullYear(), date.getUTCMonth() + 1, 0).getDate();
    let remainingDays = date.getDate();
    let quota = Math.trunc((this.foodCreditAmount - this.foodSpentAmount) / ((totalDays - remainingDays) + 1));
    let totalquota = Math.trunc((this.foodCreditAmount - this.foodSpentAmount) / totalDays);
    return quota + " / " + totalquota;
  }

  updateFirestoreDoc() {
    this.store.select('user').subscribe(async (data) => {
      await this.firestoreService.updateDoc(data!.Uid!, data);
      localStorage.setItem('user', JSON.stringify(data));
    });
  }

  getAccount() {
    this.store.select('user').subscribe((data: initalUserStateInterface) => {
      this.user = data;
      [this.account] = data.accounts.filter((acc) => acc.month === this.newDate.getMonth() + 1 && acc.year === this.newDate.getFullYear());
    });
  }

  getFirestoreDoc() {
    this.store.select(selectUid).subscribe(async (data) => {
      await this.firestoreService.getDoc(data!).then((data) => {
        localStorage.setItem('user', JSON.stringify(data.data()));
      })
    });
  }

  initializeData() {
    this.updateFirestoreDoc();
    this.getFirestoreDoc();
    this.getAccount();

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

    this.account.transactions?.forEach((data) => {
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
    let date = new Date(seconds * 1000);
    await this.store.dispatch(userActions.deleteTransaction({ transactionId: id, month: date.getMonth() + 1, year: date.getFullYear() }));
    this.initializeData();
  }

  async updateTransaction(trans: any) {
    this.transactionService.transaction.next(trans);
    this.router.navigate(['tabs', 'addtransaction']);
  }

}
