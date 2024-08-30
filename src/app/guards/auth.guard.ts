import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { initalUserStateInterface } from '../store/type/InitialUserState.interface';
import { firstValueFrom, pluck } from 'rxjs';
import { IndexdbService } from '../services/indexdb.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private indexdbService: IndexdbService) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.indexdbService.forGuard(route?.url[0]?.path);
  }
};
