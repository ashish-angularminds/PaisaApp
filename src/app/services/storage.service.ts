import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private _storage: Storage | null = null;

  constructor(private router: Router, private storage: Storage) { }

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
