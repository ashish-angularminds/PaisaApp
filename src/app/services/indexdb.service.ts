import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class IndexdbService {

  constructor(private router: Router) { }

  set(user: any, type?: string) {
    let request = indexedDB.open("userDB", 1);
    request.onerror = (event) => {
      console.log('error:', event);
    };
    request.onupgradeneeded = (event: any) => {
      const db = request.result;
      if (!db.objectStoreNames.contains("user")) {
        const objectStore = db.createObjectStore("user", { keyPath: "uid" });
        objectStore.createIndex("metadata", "metadata", { unique: false });
        objectStore.createIndex("accounts", "accounts", { unique: false });
        objectStore.createIndex("sms", "sms", { unique: false });
      }
    };
    request.onsuccess = (event: any) => {
      let db = request.result;
      let req;
      if (type === 'put') {
        req = db.transaction("user", "readwrite").objectStore("user").put(user);
      } else {
        req = db.transaction("user", "readwrite").objectStore("user").add(user);
      }
      req.onsuccess = (e: any) => {
        console.log('success');
      }
      req.onerror = (e: any) => {
        console.log('error', e);
      }
    }
  }

  async get() {
    return new Promise((RESOLVE, REJECT) => {
      let request = indexedDB.open("userDB", 1);
      request.onsuccess = (event: any) => {
        let req = request.result.transaction("user", "readwrite").objectStore("user").getAll();
        req.onsuccess = (e: any) => {
          let tmpData = { ...e.target.result[0] };
          delete tmpData.Uid;
          RESOLVE(tmpData);
        }
        req.onerror = (event) => {
          REJECT(event)
        };
      };
    })
  }

  clearAll() {
    let request = indexedDB.open("userDB", 1);
    request.onsuccess = (event: any) => {
      let db = request.result;
      let req = db.transaction("user", "readwrite").objectStore("user").clear();
      req.onsuccess = (e: any) => {
        console.log('deleted All');
      }
      req.onerror = (e: any) => {
        console.log('error', e);
      }
    }
  }

  async forGuard(value: string): Promise<boolean | UrlTree> {
    return new Promise((RESOLVE, REJECT) => {
      let request = indexedDB.open("userDB", 1);
      request.onsuccess = (event: any) => {
        let req = request.result.transaction("user", "readwrite").objectStore("user").getAll();
        req.onsuccess = (e: any) => {
          if (e.target.result.length) {
            if (value === 'tabs') {
              RESOLVE(true);
            } else {
              RESOLVE(this.router.createUrlTree(['tabs', 'home']));
            }
          } else {
            if (value === 'tabs') {
              RESOLVE(this.router.createUrlTree(['signin']));
            } else {
              RESOLVE(true);
            }
          }
        }
        req.onerror = (event) => {
          REJECT(event)
        };
      };
    })
  }

}
