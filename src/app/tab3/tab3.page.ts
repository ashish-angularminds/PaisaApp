import { Component, OnInit } from '@angular/core';
import { SMSInboxReader, SMSFilter, SMSObject } from 'capacitor-sms-inbox/dist/esm'

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

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
    let spendRegex = /sent|spent|transfer|purchase|payment|hand-picked|paid|fueled/i;
    let creditRegex = /credited/i;
    SMSInboxReader.getSMSList({ filter: this.filter }).then((data: any[any]) => {
      this.smsList = data.smsList.filter((element: SMSObject) => /Rs/i.test(element.body));
      this.spentSmsList = this.smsList.filter((element: SMSObject) => spendRegex.test(element.body));
      this.creditSmsList = this.smsList.filter((element: SMSObject) => creditRegex.test(element.body));
    });
  }

}
