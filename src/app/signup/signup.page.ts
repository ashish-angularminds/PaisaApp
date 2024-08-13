import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { FirebaseError } from 'firebase/app';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { userActions } from '../store/action';
import { FirestoreService } from '../services/firestore.service';
import { initalUserStateInterface } from '../store/type/InitialUserState.interface';

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
    private authServices: AuthService, private toastController: ToastController, private router: Router, private store: Store<{ user: initalUserStateInterface }>,
    private firestoreService: FirestoreService) { }

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      fullname: new FormControl(null, { validators: [Validators.required] }),
      email: new FormControl(null, { validators: [Validators.required, Validators.email] }),
      password: new FormControl(null, { validators: [Validators.required] })
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
          data.user?.updateProfile({ displayName: this.signupForm.controls['fullname'].value });
          this.store.dispatch(userActions.createUser({ userData: { accounts: [], lastSMSUpdate: { seconds: Date.parse(new Date(`${tmpDate.getMonth() + 1}/1/${tmpDate.getFullYear()}`).toISOString()) }, Uid: data.user!.uid, creditSMSFlag: false, debitSMSFlag: false, smsList: [] } }));
          this.store.dispatch(userActions.createAccount({
            account:
              { month: (new Date().getMonth()) + 1, year: new Date().getFullYear(), savings: 0, totalCredit: 0, totalSpent: 0, transactions: [] }
          }));
          let userData!: initalUserStateInterface;
          this.store.select('user').subscribe((data) => userData = data);
          this.firestoreService.addDoc(userData, data.user!.uid);
          this.store.select('user').subscribe((data) => {
            localStorage.setItem('user', JSON.stringify(data));
          });
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
