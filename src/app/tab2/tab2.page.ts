import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
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
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy, AfterViewInit {

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
  transaction!: FormGroup<any>;
  cdate: any;

  constructor(private formBuilder: FormBuilder, private toastController: ToastController, private store: Store<{ user: initalUserStateInterface }>, private firestore: Firestore, private firestoreService: FirestoreService, private router: Router, private transactionService: TransactionService) { }

  ngOnInit() {
    this.transaction = this.formBuilder.group({
      account: new FormControl(null, { validators: [Validators.required] }),
      amount: new FormControl(null, { validators: [Validators.required] }),
      category: new FormControl(null, { validators: [Validators.required] }),
      updatedAt: new FormControl(null, { validators: [] }),
      merchant: new FormControl(null, { validators: [] }),
      mode: new FormControl(null, { validators: [Validators.required] }),
      type: new FormControl(null, { validators: [Validators.required] }),
      id: new FormControl(null, { validators: [] }),
    });
    this.transaction?.get('type')?.setValidators([(control: AbstractControl) => {
      if (control.value !== transactionType.Debit) {
        this.transaction.controls['merchant'].disable();
      } else {
        this.transaction.controls['merchant'].enable();
      }
      return null;
    }])
    this.getAccount();
    this.transactionService.transaction.subscribe((trans: any) => {
      if (trans) {
        this.transaction.setValue({ ...trans, account: trans.account ? trans.account : '', merchant: trans.merchant ? trans.merchant : '', createdAt: this.getCurrentDateString(trans.createdAt?.seconds! * 1000) });
      } else {
        this.resetForm();
      }
    })
  }

  ngAfterViewInit(): void {
    this.transaction.addControl('createdAt', new FormControl(this.getCurrentDateString()));
  }

  getCurrentDateString(seconds?: number) {
    let mdate;
    if (seconds) {
      mdate = new Date(seconds);
    } else {
      mdate = new Date();
    }
    let flag = true;
    let fdate = mdate.toJSON().split('').filter((item) => {
      if (item === 'T') {
        flag = false;
      }
      return flag;
    }).join('');
    return (fdate + 'T' + (mdate.toLocaleTimeString()));
  }

  resetForm() {
    this.transaction.reset();
    this.transaction.removeControl('createdAt');
    this.transaction.addControl('createdAt', new FormControl(this.getCurrentDateString()));
  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'bottom',
    });
    await toast.present();
  }

  getAccount() {
    this.store.select('user').subscribe((data: initalUserStateInterface) => {
      this.user = data;
      [this.account] = data.accounts.filter((acc) => acc.month === this.newDate.getMonth() + 1 && acc.year === this.newDate.getFullYear());
    });
  }

  async addTransaction() {
    if (this.transaction.controls['id'].value) {
      this.updateTransaction()
    } else {
      let newTransactionReq: any;
      if (this.transaction.valid) {
        if (this.transaction.controls['merchant'].value) {
          newTransactionReq = {
            transaction: {
              amount: this.transaction.controls['amount'].value, account: this.transaction.controls['account'].value,
              type: this.transaction.controls['type'].value, id: uuidv4(), mode: this.transaction.controls['mode'].value,
              category: this.transaction.controls['category'].value, merchant: this.transaction.controls['merchant'].value,
              createdAt: { seconds: Date.parse(this.transaction.controls['createdAt'].value) / 1000 }, updatedAt: { seconds: this.newDateEpoch }
            },
            month: new Date(this.transaction.controls['createdAt'].value).getMonth() + 1, year: new Date(this.transaction.controls['createdAt'].value).getFullYear()
          }
        } else {
          newTransactionReq = {
            transaction: {
              amount: this.transaction.controls['amount'].value, account: this.transaction.controls['account'].value,
              type: this.transaction.controls['type'].value, id: uuidv4(), mode: this.transaction.controls['mode'].value,
              category: this.transaction.controls['category'].value,
              createdAt: { seconds: Date.parse(this.transaction.controls['createdAt'].value) / 1000 }, updatedAt: { seconds: this.newDateEpoch }
            },
            month: new Date(this.transaction.controls['createdAt'].value).getMonth() + 1, year: new Date(this.transaction.controls['createdAt'].value).getFullYear()
          }
        }
        this.store.dispatch(userActions.addTransaction(newTransactionReq));
        this.store.select('user').subscribe(data => {
          this.firestoreService.updateDoc(this.user.Uid!, data);
          localStorage.setItem('user', JSON.stringify(data));
        });
        this.presentToast('Transaction added successfully');
        this.resetForm();
        this.router.navigate(['tabs', 'home']);
      } else {
        this.presentToast('Transaction is not valid, check all fields')
      }
    }
  }

  async updateTransaction() {
    let tmpDate = new Date(this.transaction.controls['createdAt'].value);
    let updated: transactionInterface = {
      id: this.transaction.controls['id'].value,
      amount: this.transaction.controls['amount'].value,
      category: this.transaction.controls['category'].value,
      mode: this.transaction.controls['mode'].value,
      type: this.transaction.controls['type'].value,
      createdAt: { seconds: Date.parse(this.transaction.controls['createdAt'].value) / 1000 },
      updatedAt: { seconds: this.newDateEpoch }
    };
    await this.store.dispatch(userActions.updateTransaction({ month: tmpDate.getMonth() + 1, newtransaction: updated, transactionId: this.transaction.controls['id'].value, year: tmpDate.getFullYear() }));
    this.resetForm();
    this.router.navigate(['tabs', 'home']);
  }

  ngOnDestroy(): void {
    this.resetForm();
  }

}
