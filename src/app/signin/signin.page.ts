import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Store } from '@ngrx/store';
import { FirebaseError } from 'firebase/app';
import { Router } from '@angular/router';
import { initalUserStateInterface } from '../store/type/InitialUserState.interface';
import { FirestoreService } from '../services/firestore.service';
import { accountActions, metadataActions, smsActions } from '../store/action';
import { selectState } from '../store/selectors';
import { IndexdbService } from '../services/indexdb.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SigninPage implements OnInit {

  signinForm!: FormGroup;
  constructor(private formBuilder: FormBuilder, private loadingCrtl: LoadingController, private authServices: AuthService,
    private store: Store<initalUserStateInterface>, private toastController: ToastController, private router: Router,
    private fireStoreService: FirestoreService, private indexdbService: IndexdbService) { }

  ngOnInit() {
    this.signinForm = this.formBuilder.group({
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

  async signin() {
    let loader = this.loadingCrtl.create();
    (await loader).present();
    if (this.signinForm.valid) {
      await this.authServices.loginUserWithEamil(this.signinForm.controls['email'].value, this.signinForm.controls['password'].value).then(
        async (data: any) => {
          let user: initalUserStateInterface | any = (await this.fireStoreService.getDoc(data.user!.uid)).data();
          await this.store.dispatch(accountActions.set({ accounts: user.accounts }));
          await this.store.dispatch(metadataActions.set(user.metadata));
          await this.store.dispatch(smsActions.set(user.sms));
          await this.store.select(selectState).subscribe((user) => {
            this.indexdbService.set({ uid: data.user!.uid, ...user }, 'put');
          })
          this.presentToast('Login Successful');
          (await loader).dismiss();
          this.router.navigate(['tabs/home']);
        },
        async (error: FirebaseError) => {
          this.presentToast(error.message);
          (await loader).dismiss();
        }
      );
    } else {
      (await loader).dismiss();
      this.presentToast('check email and password');
    }
  }
}
