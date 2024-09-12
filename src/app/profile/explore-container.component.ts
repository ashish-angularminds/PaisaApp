import { Component, Output, EventEmitter, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, AfterViewInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from '../services/storage.service';
import { MediaService } from '../services/media.service';
import { Store } from '@ngrx/store';
import { initalUserStateInterface } from '../store/type/InitialUserState.interface';
import { metadataActions } from '../store/action';

@Component({
  selector: 'app-profile',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExploreContainerComponent implements OnInit {

  constructor(private router: Router, private loadingcontroller: LoadingController, private authService: AuthService, private storageService: StorageService,
    private changeDetector: ChangeDetectorRef, private mediaService: MediaService, private store: Store<initalUserStateInterface>
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
    this.user = { ...(await this.authService.getProfile())?.providerData[0] };
    this.changeDetector.detectChanges();
  }

  async logout(event: any) {
    let loader = this.loadingcontroller.create();
    (await loader).present();
    if (event.detail.data.action === 'logout') {
      await this.storageService.clearAll();
      await this.authService.signOut();
      this.setprofileflagfromchild.next(false);
      setTimeout(async () => {
        (await loader).dismiss();
        this.router.navigate(['/signin'], { replaceUrl: true });
      }, 0);
    }
    (await loader).dismiss();
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.mediaService.uploadImg(file)?.then((res: any) => {
      this.updateProfile(res.secure_url);
    });
  }

  @ViewChild('imgInput') imgInput: HTMLElement | any;
  updateInput() {
    this.imgInput.nativeElement?.click();
  }

  updateProfile(url?: string) {
    this.authService.getProfile().then(async (user) => {
      if (url) {
        await user?.updateProfile({ photoURL: url });
      } else {
        await user?.updateProfile({ displayName: this.user.displayName });
      }
      this.user = { ...user?.providerData[0] };
      let tmp = { ...this.user };
      delete tmp.uid;
      await this.store.dispatch(metadataActions.set(tmp));
      this.nameFlag = true;
      this.changeDetector.detectChanges();
    })
  }
}
