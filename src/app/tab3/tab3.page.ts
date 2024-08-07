import { Component, OnInit } from '@angular/core';
import { ToggleCustomEvent } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { SMSInboxReader, SMSFilter, SMSObject } from 'capacitor-sms-inbox/dist/esm'
import { userActions } from '../store/action';
import { initalUserStateInterface } from '../store/type/InitialUserState.interface';
import { transactionInterface, transactionMode, transactionType } from '../store/type/transaction.interface';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  constructor(private store: Store<{ user: initalUserStateInterface }>) { }

  transactionQueue: any = [];
  public smsList: any = [];
  public spentSmsList: any = [];
  public creditSmsList: any = [];
  sampleDate = new Date("07/01/2024").valueOf();
  filter: SMSFilter = { minDate: this.sampleDate };

  async ngOnInit(): Promise<void> {
    SMSInboxReader.checkPermissions().then(async (data: any) => {
      if (data.sms !== "granted") {
        SMSInboxReader.requestPermissions().then(() => { this.loadData() });
      } else {
        this.loadData();
      }
    })
  }

  loadData() {
    let spendRegex = /sent|spent|transfer|purchase|payment|hand-picked|paid|fueled|debited/i;
    let creditRegex = /credited/i;
    SMSInboxReader.getSMSList({ filter: this.filter }).then((data: any[any]) => {
      this.smsList = data.smsList.filter((element: SMSObject) =>
        (/Rs|debited/i.test(element.body) && /^((?!otp).)*$/gmi.test(element.body) && /^((?!statement).)*$/gmi.test(element.body)));
      // this.smsList = data.smsList.filter((element: SMSObject) => /Rs/i.test(element.body));
      this.spentSmsList = this.smsList.filter((element: SMSObject) => spendRegex.test(element.body));
      this.creditSmsList = this.smsList.filter((element: SMSObject) => creditRegex.test(element.body));
      this.organizeData();
    });
  }

  organizeData() {
    let transactionRegex = /sent|spent|transfer|purchase|payment|hand-picked|paid|fueled|debited|credited/i;
    let spendRegex = /sent|spent|transfer|purchase|payment|hand-picked|paid|fueled|debited/i;
    let creditRegex = /credited/i;
    let amountRegex = /rs|inr|by/i;
    let accountRegex = /onecard|hdfc|sbi/i;
    let modeRegex = /upi|credit|withdrawn/i;
    let merchantRegex = /to|at/i;
    let categoryRegex = /purchase|hand-picked|fueled|/i;
    let createdAtRegex = /rs/i;
    let updatedAtRegex = /rs/i;
    SMSInboxReader.getSMSList({ filter: this.filter }).then((data: any[any]) => {
      // this.smsList = data.smsList.filter((element: SMSObject) => (/Rs|debited/i.test(element.body) && /^((?!otp).)*$/gmi.test(element.body) && /^((?!statement).)*$/gmi.test(element.body)));
      let i = 0;
      for (let element of this.spentSmsList) {
        // this.smsList.forEach((element: SMSObject) => {
        i = i + 1;
        let newtransaction: any = {
          id: element.id,
          merchant: '',
          createdAt: { seconds: element.date },
          updatedAt: { seconds: element.date },
          amount: undefined,
          type: undefined,
          mode: undefined,
          account: ''
        };
        if (spendRegex.test(element.body)) {
          let splitString = element.body.split(' ');
          splitString.forEach((str: any, index: number) => {
            if (amountRegex.test(str)) {
              newtransaction.amount = newtransaction.account ? newtransaction.amount : ((str.match(/\d/g)?.length ? str.split('.')[1].match(/\d/g)?.join('') : splitString.at(index + 1) ? splitString.at(index + 1) : splitString.at(index + 2)));
            }
            if (spendRegex.test(str)) {
              newtransaction.type = transactionType.Debit;
            }
            else if (creditRegex.test(str)) {
              newtransaction.type = transactionType.Credit;
            }
            if (accountRegex.test(str)) {
              newtransaction.account = str.match(accountRegex)![0];
            }
            if (modeRegex.test(str)) {
              newtransaction.mode = str.match(modeRegex)![0] !== 'upi' ? str.match(modeRegex)![0] === 'withdraw' ? transactionMode.Debit_Card : transactionMode.Credit_Card : transactionMode.UPI;
            }
            if (merchantRegex.test(str) && /on/i.test(element.body)) {
              // let i = index + 1;
              // while (splitString[i] !== 'on') {
              //   newtransaction.merchant = newtransaction.merchant + ' ' + splitString[i];
              //   i = i + 1;
              // }
              newtransaction.merchant = splitString[i + 1];
            }
          });
        }
        this.transactionQueue.push(newtransaction);
        if (i > 15) {
          break;
        }
      }
      // this.creditSmsList = this.smsList.filter((element: SMSObject) => creditRegex.test(element.body));
    });
  }

  toggleStateChange(event: ToggleCustomEvent) {
    if (event.detail.value === "credit") {
      this.store.dispatch(userActions.updateUser({ user: { creditSMSFlag: event.detail.checked } }));
    } else {
      this.store.dispatch(userActions.updateUser({ user: { debitSMSFlag: event.detail.checked } }));
    }
  }

}
