import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, OnInit } from '@angular/core';
import { LoadingController, ToastController, ToggleCustomEvent } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { SMSInboxReader, SMSFilter, SMSObject } from 'capacitor-sms-inbox/dist/esm'
import { initalUserStateInterface, smsInterface } from '../store/type/InitialUserState.interface';
import { transactionCategory, transactionInterface, transactionMode, transactionType } from '../store/type/transaction.interface';
import { selectState } from '../store/selectors';
import { FirestoreService } from '../services/firestore.service';
import { v4 as uuidv4 } from 'uuid';
import { TransactionService } from '../services/transaction.service';
import { Router } from '@angular/router';
import { accountActions, smsActions } from '../store/action';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tab3Page implements OnInit, DoCheck {

  constructor(private store: Store<initalUserStateInterface>, private firestoreService: FirestoreService, private transactionService: TransactionService,
    private router: Router, private toastController: ToastController, private storageService: StorageService, private changeDetector: ChangeDetectorRef,
    private loaderCtr: LoadingController) { }

  public resetActionSheetButtons = [
    {
      text: 'Refresh List',
      role: 'destructive',
      data: {
        action: 'refresh',
      },
    },
    {
      text: 'Monthly Reset',
      role: 'destructive',
      data: {
        action: 'monthly-reset',
      },
    },
    {
      text: 'Complete Reset',
      role: 'destructive',
      data: {
        action: 'complete-reset',
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
  user!: initalUserStateInterface;
  smsList: any = [];
  filter!: SMSFilter;
  transactionRegex = /sent|spent|transfer|purchase|payment|hand-picked|paid|fueled|debited|credited|withdrawn/i;
  spendRegex = /sent|spent|transfer|purchase|payment|hand-picked|paid|fueled|debited/i;
  creditRegex = /credited/i;
  amountRegex = /inr|by|rs/i;
  merchantRegex = /\bto\b|\bat\b/i;
  permissionFlag = false;

  async ngOnInit() {
    this.checkPermission();
    this.store.select(selectState).subscribe(async (data) => {
      this.user = data;
      this.smsList = [...(data.sms.smsList || [])];
      await this.firestoreService.updateDoc(data.metadata.uid!, data);
      await this.storageService.set(data);
    });
    // this.loadData();
  }

  ngDoCheck(): void {
    if (!this.permissionFlag) {
      this.loadData();
    }
  }

  async checkPermission() {
    if ((await SMSInboxReader.checkPermissions()).sms !== "granted") {
      SMSInboxReader.requestPermissions().then((value: PermissionStatus | any) => {
        if (value === "granted") {
          this.permissionFlag = true;
          this.loadData();
        } else {
          this.permissionFlag = false;
        }
      });
    } else {
      this.permissionFlag = true;
    }
  }

  async loadData() {
    let tmpData: any;
    let filter: SMSFilter = { minDate: this.user.sms.lastSMSUpdate?.seconds };
    SMSInboxReader.getSMSList({ filter: filter }).then(async (data) => {
      tmpData = this.organizeData(data.smsList.filter((element: SMSObject) =>
      (this.transactionRegex.test(element.body) && /^((?!otp).)*$/gmi.test(element.body) && /^((?!statement).)*$/gmi.test(element.body)
        && /^((?!not completed).)*$/gmi.test(element.body) && /^((?!request).)*$/gmi.test(element.body))));
      await this.store.dispatch(smsActions.set({ lastSMSUpdate: { seconds: Date.now() }, smsList: [...tmpData] }));
      this.changeDetector.detectChanges();
    });
  }

  filterCategory(body:string){
    if(/delicious/i.test(body)){
      return transactionCategory.Food;
    } else if(/fueled/i.test(body)){
      return transactionCategory.Travel;
    }else if(/hand-picked|market|fruits/i.test(body)){
      return transactionCategory.Shopping;
    }else if(/medica|chemist/i.test(body)){
      return transactionCategory.Medical;
    }else {
      return transactionCategory.Other;
    }
  }

  organizeData(smsList: any): transactionInterface[] {
    let tmpQueue = [...([...this.user.sms.smsList!] || [])];
    for (let element of smsList) {
      let amountFlag = false;
      let finalamountFlag = true;
      let merchantFlag = false;
      let newtransaction: any = {
        id: element.id,
        merchant: '',
        createdAt: { seconds: element.date },
        updatedAt: { seconds: element.date },
        amount: '',
        type: this.creditRegex.test(element?.body) ? transactionType.Credit : transactionType.Debit,
        mode: /upi/i.test(element?.body) ? transactionMode.UPI : /withdrawn|atm/i.test(element?.body) ? transactionMode.Debit_Card : /bank card|card/i.test(element?.body) ? transactionMode.Credit_Card : /bank/i.test(element?.body) ? transactionMode.UPI : transactionMode.UPI,
        account: element?.address,
        category: this.filterCategory(element?.body),
        body: element?.body
      };
      if (this.spendRegex.test(element.body)) {
        let splitString = element.body.split(' ');
        splitString.forEach((str: any, index: number) => {
          if (this.amountRegex.test(str)) {
            amountFlag = true;
          }
          if (amountFlag && finalamountFlag) {
            let tmparr = str.split('.');
            if (tmparr) {
              newtransaction.amount = newtransaction.amount + ((str.match(/\d/g) ? str.split('.').map((data: any, i: number) => {
                let tmpamt = data.match(/\d/g) ? data.match(/\d/g).join('') : '';
                return i !== 0 && tmparr[i - 1].match(/\d/g) ? '.' + tmpamt : tmpamt;
              }).join('') : ''));
            }
            amountFlag = (splitString[index + 1] + splitString[index + 2]).match(/\d/g) ? true : false;
            finalamountFlag = amountFlag;
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
        });
      }
      if (newtransaction.amount) {
        tmpQueue.push(newtransaction);
      }
    }
    return tmpQueue;
  }

  async toggleStateChange(event: ToggleCustomEvent) {
    let tmp = { ...this.user.sms };
    if (event.detail.value === "credit") {
      tmp.creditSMSFlag = event.detail.checked;
      await this.store.dispatch(smsActions.set(tmp));
    } else {
      await this.store.dispatch(smsActions.set({ debitSMSFlag: event.detail.checked }));
    }
  }

  async addTransaction(newtransaction: any) {
    let newTransactionReq;
    if (newtransaction?.amount > 0 &&
      newtransaction?.account !== undefined &&
      newtransaction?.type < 2 &&
      newtransaction?.mode < 4 &&
      newtransaction?.category < 5 &&
      newtransaction?.createdAt !== undefined &&
      newtransaction?.updatedAt !== undefined &&
      newtransaction?.body &&
      newtransaction?.merchant) {
      if (newtransaction?.type === transactionType.Debit) {
        newTransactionReq = {
          transaction: {
            amount: Number(newtransaction?.amount), account: newtransaction?.account,
            type: newtransaction?.type, id: uuidv4(), mode: newtransaction?.mode, category: newtransaction?.category, merchant: newtransaction?.merchant,
            createdAt: newtransaction?.createdAt, updatedAt: { seconds: Date.now() }, body: newtransaction?.body
          },
          month: new Date(newtransaction?.createdAt.seconds).getMonth() + 1, year: new Date(newtransaction?.createdAt.seconds).getFullYear()
        }
      } else {
        newTransactionReq = {
          transaction: {
            amount: Number(newtransaction?.amount), account: newtransaction?.account,
            type: newtransaction?.type, id: uuidv4(), mode: newtransaction?.mode, category: newtransaction?.category,
            createdAt: newtransaction?.createdAt, updatedAt: { seconds: Date.now() }, body: newtransaction?.body
          },
          month: new Date(newtransaction?.createdAt.seconds).getMonth() + 1, year: new Date(newtransaction?.createdAt.seconds).getFullYear()
        }
      }
      this.deleteTransaction(newtransaction.id);
      await this.store.dispatch(accountActions.addTransaction(newTransactionReq));
      this.transactionService.presentToast('Transaction is add from SMS list successfully');
    } else {
      this.transactionService.presentToast('Transaction is not complete/valid.')
    }
  }

  editTransaction(newtransaction: any) {
    let newTransactionReq = {
      smsId: newtransaction.id, id: null, amount: Number(newtransaction?.amount), account: newtransaction?.account,
      type: newtransaction?.type, mode: newtransaction?.mode, category: newtransaction?.category, merchant: newtransaction?.merchant,
      createdAt: newtransaction?.createdAt, updatedAt: { seconds: Date.now() }, body: newtransaction?.body
    };
    this.transactionService.transaction.next(newTransactionReq);
    this.router.navigate(['tabs', 'addtransaction']);
  }

  async deleteTransaction(id: any) {
    let tmpList = [...this.user.sms.smsList!.filter((data: any) => {
      if (data.id === id) {
        return false;
      } else {
        return true;
      }
    })];
    await this.store.dispatch(smsActions.set({ smsList: tmpList }));
    this.transactionService.presentToast('Transaction is deleted from SMS list successfully');
  }

  async resetList(event: any) {
    if (event.detail.data.action === "complete-reset") {
      await this.store.dispatch(smsActions.set({ smsList: [], lastSMSUpdate: { seconds: Date.now() } }));
      this.loadData();
      this.transactionService.presentToast("SMS list is reset and set to current date");
    } else if (event.detail.data.action === "monthly-reset") {
      await this.store.dispatch(smsActions.set({ smsList: [], lastSMSUpdate: { seconds: new Date(`${new Date().getMonth() + 1}/1/${new Date().getFullYear()}`).valueOf() } }));
      this.loadData();
      this.transactionService.presentToast("SMS list is reset and set to months first day");
    } else if (event.detail.data.action === "refresh") {
      this.loadData();
    }
  }
}
