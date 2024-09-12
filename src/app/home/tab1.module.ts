import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { Tab1PageRoutingModule } from './tab1-routing.module';
import { ExploreContainerComponent } from '../profile/explore-container.component';
import { SortListPipe } from '../pipes/sort-list.pipe';
import { CategoryPipe } from '../pipes/category.pipe';
import { FullDatePipe } from '../pipes/full-date.pipe';
import { ModePipe } from '../pipes/mode.pipe';
import { environment } from '../../environments/environment'
import { HttpClientModule } from '@angular/common/http';
import { MediaService } from '../services/media.service';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab1PageRoutingModule,
    SortListPipe,
    FullDatePipe,
    CategoryPipe,
    ModePipe,
    HttpClientModule
  ],
  providers: [
    MediaService
  ],
  declarations: [Tab1Page, ExploreContainerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Tab1PageModule { }
