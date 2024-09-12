import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, ElementRef, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { FirestoreService } from '../services/firestore.service';
import { transactionCategory, transactionMode, transactionType } from '../store/type/transaction.interface';
import { Router } from '@angular/router';
import { initalUserStateInterface } from '../store/type/InitialUserState.interface';
import { TransactionService } from '../services/transaction.service';
import { selectState } from '../store/selectors';
import { accountActions } from '../store/action';
import { AnimationController, LoadingController, NavController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';
import { register } from 'swiper/element/bundle';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Tab1Page implements OnInit, DoCheck, OnDestroy {

  user!: initalUserStateInterface;
  transactionId: string = '';
  profileModelFlag = false;
  account: any;
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

  constructor(private store: Store<initalUserStateInterface>, private firestoreService: FirestoreService,
    private router: Router, private transactionService: TransactionService, private storageService: StorageService,
    private changeDetector: ChangeDetectorRef, private loaderCtr: LoadingController, private authService: AuthService,
    private navCtrl: NavController, private animationCtrl: AnimationController, private ref: ElementRef) {
    this.account = {
      "month": 0,
      "year": 0,
      "savings": 0,
      "totalCredit": 0,
      "totalSpent": 0,
      "transactions": []
    }
    register();
  }

  async ngOnInit() {
    this.store.select(selectState).subscribe(async (data: initalUserStateInterface) => {
      if (data) {
        this.user = { ...data };
        [this.account] = Object.values(data.accounts).filter((acc: any) => acc?.month === this.newDate.getMonth() + 1 && acc.year === this.newDate.getFullYear());
        if (this.account?.transactions) {
          this.transactions = [...Object.values(this.account?.transactions)];
          this.initializeData();
        }
        this.firestoreService.updateDoc(data.metadata.uid!, data).catch(async (error) => {
          console.log(error);
          await this.storageService.clearAll();
          await this.authService.signOut();
          this.router.navigate(['/signin'], { replaceUrl: true });
        });
        await this.storageService.set(this.user);
        this.changeDetector.detectChanges();
      }
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
    this.changeDetector.detectChanges();
  }

  async deleteTransaction(id: string, seconds: number) {
    let date = new Date(seconds);
    await this.store.dispatch(accountActions.deleteTransaction({ transactionId: id, month: date.getMonth() + 1, year: date.getFullYear() }));
    this.transactionService.presentToast("Transaction deleted successfully");
    this.initializeData();
  }

  async updateTransaction(trans: any) {
    let tmpTransaction = { ...trans };
    if (!tmpTransaction.merchant) {
      tmpTransaction.merchant = "NAN";
    }
    this.transactionService.transaction.next(tmpTransaction);
    this.router.navigateByUrl('tabs/addtransaction');
  }

  ngDoCheck(): void {
    console.log();
  }

  ngOnDestroy(): void {
    console.log('destroy');
  }
}
