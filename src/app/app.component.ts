import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { StorageService } from './services/storage.service';
import { AnimationBuilder, AnimationController, createAnimation } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  constructor(private storageService: StorageService) { }
  animation: AnimationBuilder = (baseEl) => {
    let tmp = new AnimationController();
    let test = tmp.create().addElement(baseEl)
      .duration(5000)
      .fromTo('opacity', '0', '1');
    test.play();
    return tmp.create().addAnimation([test]);
  }
  async ngOnInit() {
    await this.storageService.setAllDatatoStore();
  }
}
