import { Component, OnInit } from '@angular/core';
import { IndexdbService } from '../services/indexdb.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {

  constructor(private indexdbService: IndexdbService) { }

  async ngOnInit() {
    // this.indexdbService.set({
    //   Uid: '1',
    //   metadata: {
    //     "displayName": null,
    //     "email": "testnew@3.in",
    //     "phoneNumber": null,
    //     "photoURL": null,
    //     "providerId": "password",
    //     "uid": "testnew@3.in",
    //     "Uid": "ZDKIde4zLWQXJy5l5zzy83uEYXJ3"
    //   },
    //   sms: {
    //     "lastSMSUpdate": {
    //       "seconds": 1722450600000
    //     },
    //     "creditSMSFlag": false,
    //     "debitSMSFlag": false,
    //     "smsList": []
    //   },
    //   accounts: {
    //     "0": {
    //       "month": 8,
    //       "year": 2024,
    //       "savings": 0,
    //       "totalCredit": 0,
    //       "totalSpent": 0,
    //       "transactions": []
    //     }
    //   }
    // })
    console.log(await this.indexdbService.get());
  }

}
