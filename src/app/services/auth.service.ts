import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<firebase.User | null>;

  constructor(private ngFireAuth: AngularFireAuth) {
    this.setPersistence();
    this.user$ = ngFireAuth.authState;
  }

  async registerUser(email: string, password: string) {
    return await this.ngFireAuth.createUserWithEmailAndPassword(email, password);
  }

  async loginUserWithEamil(email: string, password: string) {
    return await this.ngFireAuth.signInWithEmailAndPassword(email, password);
  }

  async loginUserWithPhone(phone: string, applicationVerifier: any) {
    return await this.ngFireAuth.signInWithPhoneNumber(phone, applicationVerifier);
  }

  async resetPassword(email: string) {
    return await this.ngFireAuth.sendPasswordResetEmail(email);
  }

  async signOut() {
    return await this.ngFireAuth.signOut();
  }

  async getProfile() {
    return await this.ngFireAuth.currentUser;
  }

  async setPersistence() {
    try {
      await this.ngFireAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      console.log('LOCAL');
    } catch (error) {
      console.error('Error setting persistence:', error);
    }
  }

  isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(
      map(user => !!user) // Return true if a user is authenticated, otherwise false
    );
  }
}
