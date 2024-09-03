import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { FirestoreService } from '../services/firestore.service';
import { transactionInterface, transactionCategory, transactionMode, transactionType } from '../store/type/transaction.interface';
import { Router } from '@angular/router';
import { initalUserStateInterface } from '../store/type/InitialUserState.interface';
import { ToastController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';
import { TransactionService } from '../services/transaction.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { accountsInterface } from '../store/type/account.interface';
import { selectState } from '../store/selectors';
import { accountActions, smsActions } from '../store/action';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tab2Page implements OnInit, OnDestroy, AfterViewInit {

  user!: initalUserStateInterface;
  transactionId: string = '';
  addTransactionModelFlag = false;
  profileModelFlag = false;
  smsTransactionListModelFlag: boolean = false;
  account!: accountsInterface;
  newDate = new Date();
  newDateEpoch = Date.now();
  transactionType = transactionType;
  transactionCategory = transactionCategory;
  transactionMode = transactionMode;
  transaction!: FormGroup<any>;
  cdate: any;
  smsId: any;

  constructor(private formBuilder: FormBuilder, private store: Store<initalUserStateInterface>,
    private firestoreService: FirestoreService, private router: Router, private transactionService: TransactionService, private storageService: StorageService) { }

  ngOnInit() {
    this.transaction = this.formBuilder.group({
      amount: new FormControl(null, { validators: [Validators.required] }),
      account: new FormControl(null, { validators: [Validators.required] }),
      merchant: new FormControl(null, { validators: [] }),
      body: new FormControl(null, { validators: [Validators.required] }),
      category: new FormControl(null, { validators: [Validators.required] }),
      updatedAt: new FormControl(null, { validators: [] }),
      mode: new FormControl(null, { validators: [Validators.required] }),
      type: new FormControl(null, { validators: [Validators.required] }),
      id: new FormControl(null, { validators: [] }),
      createdAt: new FormControl(null)
    });
    this.transaction?.get('type')?.setValidators([(control: AbstractControl) => {
      if (control.value !== transactionType.Debit) {
        this.transaction.controls['merchant'].disable();
      } else {
        this.transaction.controls['merchant'].enable();
      }
      return null;
    }]);
    this.transactionService.transaction.subscribe((trans: any) => {
      if (JSON.stringify(trans) !== "{}") {
        this.resetForm();
        this.smsId = trans.smsId;
        delete trans.smsId;
        this.transaction.setValue({ ...trans });
        this.transaction.removeControl('createdAt');
        this.transaction.addControl('createdAt', new FormControl(this.getCurrentDateString(trans.createdAt?.seconds!)));
      } else {
        this.resetForm();
      }
    });
    this.store.select(selectState).subscribe(async (data) => {
      this.user = data;
      await this.storageService.set(data);
      await this.firestoreService.updateDoc(data.metadata.uid!, data);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      document.getElementsByTagName('ion-datetime-button')[0].shadowRoot?.childNodes.forEach((element: any) => {
        element.style.background = "transparent";
      })
    }, 1000);
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
    return (fdate + 'T' + (mdate.toTimeString().split(' ')[0]));
  }

  resetForm() {
    this.transaction.reset();
    // this.transaction.controls['createdAt'].setValue(this.getCurrentDateString());
    // this.transaction.removeControl('createdAt');
    // this.transaction.addControl('createdAt', new FormControl(this.getCurrentDateString()));
  }

  async addTransaction() {
    if (this.transaction.controls['id'].value) {
      this.updateTransaction()
    } else {
      let newTransactionReq: any;
      if (this.transaction.valid) {
        let createdAt = Date.parse(this.transaction.controls['createdAt'].value) ? new Date(Date.parse(this.transaction.controls['createdAt'].value)) : this.newDate;
        if (this.transaction.controls['merchant'].value) {
          newTransactionReq = {
            transaction: {
              amount: this.transaction.controls['amount'].value, account: this.transaction.controls['account'].value,
              type: this.transaction.controls['type'].value, id: uuidv4(), mode: this.transaction.controls['mode'].value,
              category: this.transaction.controls['category'].value, merchant: this.transaction.controls['merchant'].value,
              createdAt: { seconds: Date.parse(createdAt + '') },
              updatedAt: { seconds: this.newDateEpoch }, body: this.transaction.controls['body'].value
            },
            month: new Date(createdAt).getMonth() + 1, year: new Date(createdAt).getFullYear()
          }
        } else {
          newTransactionReq = {
            transaction: {
              amount: this.transaction.controls['amount'].value, account: this.transaction.controls['account'].value,
              type: this.transaction.controls['type'].value, id: uuidv4(), mode: this.transaction.controls['mode'].value,
              category: this.transaction.controls['category'].value, body: this.transaction.controls['body'].value,
              createdAt: { seconds: Date.parse(createdAt + '') },
              updatedAt: { seconds: this.newDateEpoch }
            },
            month: new Date(createdAt).getMonth() + 1, year: new Date(createdAt).getFullYear()
          }
        }
        await this.store.dispatch(accountActions.addTransaction(newTransactionReq));
        this.transactionService.presentToast('Transaction added successfully');
        this.resetForm();
        if (this.smsId) {
          let tmpList = [...this.user.sms.smsList!.filter((data: any) => {
            if (data.id === this.smsId) {
              return false;
            } else {
              return true;
            }
          })];
          await this.store.dispatch(smsActions.set({ smsList: tmpList }));
          this.smsId = null;
          this.router.navigate(['tabs', 'smslog'], { replaceUrl: true });
        } else {
          this.router.navigate(['tabs', 'home'], { replaceUrl: true });
        }
      } else {
        this.transactionService.presentToast('Transaction is not valid, check all fields')
      }
    }
  }

  async updateTransaction() {
    let tmpDate = new Date(this.transaction.controls['createdAt'].value);
    let updated: transactionInterface = {
      id: this.transaction.controls['id'].value,
      amount: this.transaction.controls['amount'].value,
      account: this.transaction.controls['account'].value,
      body: this.transaction.controls['body'].value,
      category: this.transaction.controls['category'].value,
      mode: this.transaction.controls['mode'].value,
      type: this.transaction.controls['type'].value,
      createdAt: { seconds: Date.parse(this.transaction.controls['createdAt'].value) },
      updatedAt: { seconds: this.newDateEpoch }
    };
    if (this.transaction.controls['merchant'].value) {
      updated.merchant = this.transaction.controls['merchant'].value;
    }
    await this.store.dispatch(accountActions.updateTransaction({ month: tmpDate.getMonth() + 1, newtransaction: updated, transactionId: this.transaction.controls['id'].value, year: tmpDate.getFullYear() }));
    this.resetForm();
    this.router.navigate(['tabs', 'home'], { replaceUrl: true });
  }

  ngOnDestroy(): void {
    this.resetForm();
  }

}
