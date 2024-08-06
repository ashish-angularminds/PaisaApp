import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { initalUserStateInterface } from '../store/type/InitialUserState.interface';
import { firstValueFrom, pluck } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private store: Store<{ user: initalUserStateInterface }>, private router: Router) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (localStorage.getItem('user')) {
      if (route?.url[0]?.path !== "tabs") {
        this.router.navigate(['tabs', 'home']);
        return false;
      } else {
        return true;
      }
    } else {
      if (route?.url[0]?.path === "tabs") {
        this.router.navigate(['signin']);
        return false;
      } else {
        return true;
      }
    }
  }
};
