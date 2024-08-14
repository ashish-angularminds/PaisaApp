import { Component, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { initalUserStateInterface } from 'src/app/store/type/InitialUserState.interface';

@Component({
  selector: 'app-profile',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExploreContainerComponent implements OnInit {

  constructor(private router: Router, private loadingcontroller: LoadingController, private authService: AuthService) { }

  @Output() setprofileflagfromchild = new EventEmitter<boolean>();
  user: any;
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
    this.user = JSON.parse(localStorage.getItem('profile')!);
  }

  async logout(event: any) {
    let loader = this.loadingcontroller.create();
    (await loader).present();
    if (event.detail.data.action === 'logout') {
      localStorage.removeItem('profile');
      localStorage.removeItem('user');
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
