import { Component, OnInit } from '@angular/core';
import { ToastController, ToggleCustomEvent } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { SMSInboxReader, SMSFilter, SMSObject } from 'capacitor-sms-inbox/dist/esm'
import { userActions } from '../store/action';
import { initalUserStateInterface } from '../store/type/InitialUserState.interface';
import { transactionCategory, transactionInterface, transactionMode, transactionType } from '../store/type/transaction.interface';
import { selectUid } from '../store/selectors';
import { FirestoreService } from '../services/firestore.service';
import { v4 as uuidv4 } from 'uuid';
import { TransactionService } from '../services/transaction.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  constructor(private store: Store<{ user: initalUserStateInterface }>, private firestoreService: FirestoreService, private transactionService: TransactionService, private router: Router, private toastController: ToastController) { }

  public resetActionSheetButtons = [
    {
      text: 'Reset',
      role: 'destructive',
      data: {
        action: 'reset',
      },
    },
    {
      text: 'Cancel',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];
  transactionQueue: any = [];
  public smsList: any = [];
  filter!: SMSFilter;
  transactionRegex = /sent|spent|transfer|purchase|payment|hand-picked|paid|fueled|debited|credited|withdrawn/i;
  spendRegex = /sent|spent|transfer|purchase|payment|hand-picked|paid|fueled|debited/i;
  creditRegex = /credited/i;
  amountRegex = /inr|by|rs/i;
  merchantRegex = /\bto\b|\bat\b/i;
  // public spentSmsList: any = [];
  // public creditSmsList: any = [];
  // sampleDate = new Date("07/01/2024").valueOf();
  // let categoryRegex = /purchase|hand-picked|fueled|/i;
  // let transactionRegex = /sent|spent|transfer|purchase|payment|hand-picked|paid|fueled|debited|credited/i;
  // let accountRegex = /onecard|hdfc|sbi/i;
  // let modeRegex = /upi|credit|withdrawn|card|bank/i;
  // let typeRegex = /card/i;
  // let updatedAtRegex = /rs/i;
  // let spendRegex = /sent|spent|transfer|purchase|payment|hand-picked|paid|fueled|debited|withdrawn/i;
  // let creditRegex = /credited/i;

  async ngOnInit() {
    SMSInboxReader.checkPermissions().then(async (data: any) => {
      if (data.sms !== "granted") {
        SMSInboxReader.requestPermissions().then(() => { this.loadData() });
      } else {
        this.loadData();
      }
    })
  }

  getFirestoreDoc() {
    this.store.select(selectUid).subscribe(async (data) => {
      await this.firestoreService.getDoc(data!).then((data) => {
        localStorage.setItem('user', JSON.stringify(data.data()));
      })
    });
  }

  updateFirestoreDoc() {
    this.store.select('user').subscribe(async (data) => {
      await this.firestoreService.updateDoc(data!.Uid!, data);
      localStorage.setItem('user', JSON.stringify(data));
    });
  }

  async loadData() {
    this.store.select('user').subscribe((data) => {
      this.transactionQueue = data.smsList;
      SMSInboxReader.getSMSList({ filter: { minDate: data.lastSMSUpdate.seconds } }).then((data: any[any]) => {
        this.smsList = data.smsList.filter((element: SMSObject) =>
          (this.transactionRegex.test(element.body) && /^((?!otp).)*$/gmi.test(element.body) && /^((?!statement).)*$/gmi.test(element.body) && /^((?!not completed).)*$/gmi.test(element.body) && /^((?!request).)*$/gmi.test(element.body)));
        // this.smsList = data.smsList.filter((element: SMSObject) => /Rs/i.test(element.body));
        // this.spentSmsList = this.smsList.filter((element: SMSObject) => spendRegex.test(element.body));
        // this.creditSmsList = this.smsList.filter((element: SMSObject) => creditRegex.test(element.body));
        this.organizeData();
      });
    });
  }

  async organizeData() {
    for (let element of this.smsList) {
      let merchantFlag = false;
      let newtransaction: any = {
        id: element.id,
        merchant: '',
        createdAt: { seconds: element.date },
        updatedAt: { seconds: element.date },
        amount: undefined,
        type: this.creditRegex.test(element?.body) ? transactionType.Credit : transactionType.Debit,
        mode: /upi/i.test(element?.body) ? transactionMode.UPI : /withdrawn|atm/i.test(element?.body) ? transactionMode.Debit_Card : /bank card|card/i.test(element?.body) ? transactionMode.Credit_Card : /bank/i.test(element?.body) ? transactionMode.UPI : undefined,
        account: element?.address,
        category: /delicious/i.test(element?.body) ? transactionCategory.Food : /fueled/i.test(element?.body) ? transactionCategory.Travel : /hand-picked|market|fruits/i.test(element?.body) ? transactionCategory.Shopping : /medica|chemist|/i.test(element?.body) ? transactionCategory.Medical : transactionCategory.Other,
        body: element?.body
      };
      if (this.spendRegex.test(element.body)) {
        let splitString = element.body.split(' ');
        splitString.forEach((str: any, index: number) => {
          if (this.amountRegex.test(str)) {
            newtransaction.amount = newtransaction.amount ? newtransaction.amount : ((str.match(/\d/g)?.length ? str.split('.')[1].match(/\d/g)?.join('') : splitString.at(index + 1) ? splitString.at(index + 1) : splitString.at(index + 2)));
          }
          if (this.merchantRegex.test(element?.body) && /on/i.test(element.body) && newtransaction.type === transactionType.Debit) {
            if (merchantFlag) {
              if (/on\b/i.test(str)) {
                merchantFlag = false;
              } else {
                newtransaction.merchant = newtransaction.merchant + ' ' + str;
              }
            }
            if (this.merchantRegex.test(str) && !newtransaction.merchant) {
              merchantFlag = true;
            }
          }
          // let i = index + 1;
          // while (splitString[i] !== 'on') {
          //   newtransaction.merchant = newtransaction.merchant + ' ' + splitString[i];
          //   i = i + 1;
          // }
          // newtransaction.merchant = splitString[i + 1];
          // }
          // if (spendRegex.test(str)) {
          //   newtransaction.type = transactionType.Debit;
          // }
          // if (accountRegex.test(str)) {
          //   newtransaction.account = str.match(accountRegex)![0];
          // }
          // if (modeRegex.test(str)) {
          //   newtransaction.mode = newtransaction.mode ? newtransaction.mode : (str.match(/bank/) ? (str.match(/upi/) ? transactionMode.UPI : transactionMode.Debit_Card) : transactionMode.Credit_Card) : transactionMode.UPI;
          // }
        });
      }
      if (newtransaction.amount) {
        this.transactionQueue.push(newtransaction);
      }
    }
    await this.store.dispatch(userActions.updateUser({ user: { smsList: this.transactionQueue, lastSMSUpdate: { seconds: Date.now() } } }));
    this.updateFirestoreDoc();
    this.getFirestoreDoc();
  }

  toggleStateChange(event: ToggleCustomEvent) {
    if (event.detail.value === "credit") {
      this.store.dispatch(userActions.updateUser({ user: { creditSMSFlag: event.detail.checked } }));
    } else {
      this.store.dispatch(userActions.updateUser({ user: { debitSMSFlag: event.detail.checked } }));
    }
  }

  reverseList(list: any) {
    let tmpList = [...list];
    return tmpList.sort((a: any, b: any) => {
      const aDate: any = new Date(b?.createdAt?.seconds * 1000);
      const bDate: any = new Date(a?.createdAt?.seconds * 1000);
      return aDate - bDate;
    });
  }

  dateConverter(date: any) {
    return (new Date(date.seconds).toLocaleDateString()) + " - " + (new Date(date.seconds).toLocaleTimeString('en-US'));
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


  getTransactionMode(data: any) {
    switch (data) {
      case 0:
        return "Cash";
      case 1:
        return "UPI";
      case 2:
        return "Credit";
      case 3:
        return "Debit";
      default:
        return "";
    }
  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'bottom',
    });
    await toast.present();
  }

  async addTransaction(newtransaction: any) {
    let newTransactionReq;
    if (newtransaction?.amount && newtransaction?.account &&
      newtransaction?.type &&
      newtransaction?.mode &&
      newtransaction?.category &&
      newtransaction?.createdAt &&
      newtransaction?.updatedAt) {
      if (newtransaction?.type === transactionType.Debit) {
        newTransactionReq = {
          transaction: {
            amount: Number(newtransaction?.amount), account: newtransaction?.account,
            type: newtransaction?.type, id: uuidv4(), mode: newtransaction?.mode, category: newtransaction?.category, merchant: newtransaction?.merchant,
            createdAt: newtransaction?.createdAt, updatedAt: { seconds: Date.now() }
          },
          month: new Date(newtransaction?.createdAt.seconds).getMonth() + 1, year: new Date(newtransaction?.createdAt.seconds).getFullYear()
        }
      } else {
        newTransactionReq = {
          transaction: {
            amount: Number(newtransaction?.amount), account: newtransaction?.account,
            type: newtransaction?.type, id: uuidv4(), mode: newtransaction?.mode, category: newtransaction?.category,
            createdAt: newtransaction?.createdAt, updatedAt: { seconds: Date.now() }
          },
          month: new Date(newtransaction?.createdAt.seconds).getMonth() + 1, year: new Date(newtransaction?.createdAt.seconds).getFullYear()
        }
      }
      await this.store.dispatch(userActions.addTransaction(newTransactionReq));
      this.updateFirestoreDoc();
      this.getFirestoreDoc();
    }
  }

  editTransaction(newtransaction: any) {
    let newTransactionReq = {
      transaction: {
        amount: Number(newtransaction?.amount), account: newtransaction?.account,
        type: newtransaction?.type, id: uuidv4(), mode: newtransaction?.mode, category: newtransaction?.category, merchant: newtransaction?.merchant,
        createdAt: newtransaction?.createdAt, updatedAt: { seconds: Date.now() }
      },
      month: new Date(newtransaction?.createdAt.seconds).getMonth() + 1, year: new Date(newtransaction?.createdAt.seconds).getFullYear()
    };
    this.transactionService.transaction.next(newTransactionReq);
    this.router.navigate(['tabs', 'addtransaction']);
  }

  async deleteTransaction(id: any) {
    this.transactionQueue = this.transactionQueue.filter((data: any) => {
      if (data.id === id) {
        return false;
      } else {
        return true;
      }
    });
    await this.store.dispatch(userActions.updateUser({ user: { smsList: this.transactionQueue } }));
    this.updateFirestoreDoc();
    this.getFirestoreDoc();
  }

  async resetList(event: any) {
    this.presentToast(JSON.stringify(event.detail, null, 2));
    if (event.detail.data.action === "reset") {
      await this.store.dispatch(userActions.updateUser({ user: { smsList: [], lastSMSUpdate: { seconds: Date.now() } } }));
      this.updateFirestoreDoc();
      this.getFirestoreDoc();
    }
  }
}
