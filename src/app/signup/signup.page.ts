import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { FirebaseError } from 'firebase/app';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FirestoreService } from '../services/firestore.service';
import { initalUserStateInterface } from '../store/type/InitialUserState.interface';
import { accountActions, metadataActions, smsActions } from '../store/action';
import { selectState } from '../store/selectors';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupPage implements OnInit {
  user: any;
  signupForm!: FormGroup<any>;
  constructor(private formBuilder: FormBuilder, private loadingCrtl: LoadingController,
    private authServices: AuthService, private toastController: ToastController, private router: Router, private store: Store<initalUserStateInterface>,
    private firestoreService: FirestoreService, private storageService: StorageService) { }

  async ngOnInit() {
    this.signupForm = this.formBuilder.group({
      fullname: new FormControl(null, { validators: [Validators.required] }),
      email: new FormControl(null, { validators: [Validators.required, Validators.email] }),
      password: new FormControl(null, { validators: [Validators.required] })
    });
    await this.store.select(selectState).subscribe(async (user) => {
      await this.storageService.set(user);
      await this.firestoreService.addDoc(user, user.metadata.uid!);
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

  async signup() {
    let tmpDate = new Date();
    let loader = this.loadingCrtl.create();
    (await loader).present();
    if (this.signupForm.valid) {
      await this.authServices.registerUser(this.signupForm.controls['email'].value, this.signupForm.controls['password'].value).then(
        async (data: any) => {
          localStorage.setItem('profile', JSON.stringify(await data.user?.providerData[0]));
          await data.user?.updateProfile({ displayName: this.signupForm.controls['fullname'].value });
          let user = await data.user?.providerData[0];
          user.uid = data.user!.uid;
          await this.store.dispatch(metadataActions.set(user));
          await this.store.dispatch(smsActions.set({ lastSMSUpdate: { seconds: Date.parse(new Date(`${tmpDate.getMonth() + 1}/1/${tmpDate.getFullYear()}`).toISOString()) }, creditSMSFlag: false, debitSMSFlag: false, smsList: [] }));
          await this.store.dispatch(accountActions.createAccount({
            account:
              { month: (tmpDate.getMonth()) + 1, year: tmpDate.getFullYear(), savings: 0, totalCredit: 0, totalSpent: 0, transactions: [] }
          }));
          (await loader).dismiss();
          this.presentToast('Registration successful');
          this.router.navigate(['tabs/home']);
        }, async (error: FirebaseError) => {
          (await loader).dismiss();
          this.presentToast(error.message);
        });
    } else {
      this.presentToast('check email and password');
      (await loader).dismiss();
    }
  }

}
