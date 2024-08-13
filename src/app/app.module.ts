import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { provideStore, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AngularFireAuthModule } from '@angular/fire/compat/auth'
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
import { ReactiveFormsModule } from '@angular/forms';
import { userReducer } from './store/reducers';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot({ animated: true }), AppRoutingModule, ReactiveFormsModule,
    StoreModule.forRoot({ user: userReducer }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: true,
      autoPause: true,
      features: {
        pause: true,
        lock: true,
        persist: true
      }
    }),
    AngularFireModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, provideFirebaseApp(() => initializeApp({
    apiKey: "AIzaSyAMJ204CcdQLi4ybWr1w5t6x5HlHDfOCcE",
    authDomain: "paisa-app-700fe.firebaseapp.com",
    projectId: "paisa-app-700fe",
    storageBucket: "paisa-app-700fe.appspot.com",
    messagingSenderId: "574676221207",
    appId: "1:574676221207:web:d6eebcefa505678bcccb52",
    measurementId: "G-M6EV1C2WKH"
  })), provideFirestore(() => getFirestore()), provideDatabase(() => getDatabase()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
