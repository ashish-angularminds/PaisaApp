import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { BehaviorSubject, skip } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private toastController: ToastController) { }

  transaction = new BehaviorSubject({});

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'bottom',
    });
    await toast.present();
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
}
