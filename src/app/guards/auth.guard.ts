import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';
import { catchError, map, Observable, of, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) { }

  canActivate(route: any): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      take(1),
      map(authenticated => {
        if (authenticated) {
          if (route?.url[0]?.path === "tabs") {
            return true;
          } else {
            this.router.navigate(['tabs', 'home']);
            return false;
          }
        } else {
          if (route?.url[0]?.path.includes("tabs")) {
            this.router.navigate(['signin']);
            return false;
          } else {
            return true;
          }
        }
      }),
      catchError(error => {
        console.error('AuthGuard error:', error);
        this.router.navigate(['tabs', 'home']); // Handle errors (e.g., redirect to login)
        return of(true);
      })
    );
  }
};
