import { Component, Output, EventEmitter, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { initalUserStateInterface } from 'src/app/store/type/InitialUserState.interface';
import { IndexdbService } from '../services/indexdb.service';

@Component({
  selector: 'app-profile',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExploreContainerComponent implements OnInit {

  constructor(private router: Router, private loadingcontroller: LoadingController, private authService: AuthService, private indexdbService: IndexdbService,
    private changeDetector: ChangeDetectorRef
  ) { }

  @Output() setprofileflagfromchild = new EventEmitter<boolean>();
  user: any = {
    providerId: null,
    uid: null,
    displayName: null,
    email: null,
    phoneNumber: null,
    photoURL: null
  };
  nameFlag = true;
  emailFlag = true;
  phoneFlag = true;
  public actionSheetButtons = [
    {
      text: 'Logout',
      role: 'destructive',
      data: {
        action: 'logout',
      },
    },
    {
      text: 'Cancel',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];

  async ngOnInit() {
    this.user = (await this.authService.getProfile())?.providerData[0];
    this.changeDetector.detectChanges();
  }

  async logout(event: any) {
    let loader = this.loadingcontroller.create();
    (await loader).present();
    if (event.detail.data.action === 'logout') {
      this.indexdbService.clearAll();
      await this.authService.signOut();
      this.setprofileflagfromchild.next(false);
      setTimeout(async () => {
        (await loader).dismiss();
        this.router.navigate(['/signin']);
      }, 0);
    }
    (await loader).dismiss();
  }

}
