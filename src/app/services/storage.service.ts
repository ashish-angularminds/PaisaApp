import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { Store } from '@ngrx/store';
import { initalUserStateInterface } from '../store/type/InitialUserState.interface';
import { accountActions, metadataActions, smsActions } from '../store/action';
import { accountsInterface } from '../store/type/account.interface';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private _storage: Storage | null = null;

  constructor(private store: Store<initalUserStateInterface>, private storage: Storage) {
  }

  async setAllDatatoStore() {
    let newDate = new Date();
    let data = await this.get();
    if (data) {
      await this.store.dispatch(metadataActions.set(data.metadata));
      await this.store.dispatch(smsActions.set(data.sms));
      if ((Object.values(data.accounts)).filter((data: any) => data.month === (newDate.getMonth() + 1)).length === 0) {
        let tmp: accountsInterface[] = Object.values(data.accounts);
        tmp.push({
          month: newDate.getMonth() + 1,
          year: newDate.getFullYear(),
          savings: 0,
          totalCredit: 0,
          totalSpent: 0,
          transactions: []
        })
        await this.store.dispatch(accountActions.set({ accounts: tmp }));
      } else {
        await this.store.dispatch(accountActions.set({ accounts: data.accounts }));
      }
    }
  }

  async set(user: any) {
    this._storage = await this.storage.create();
    this._storage?.set('userDB', user);
  }

  async get() {
    this._storage = await this.storage.create();
    return await this._storage!.get!('userDB');
  }

  async clearAll() {
    this._storage = await this.storage.create();
    await this._storage!.clear();
  }
}
