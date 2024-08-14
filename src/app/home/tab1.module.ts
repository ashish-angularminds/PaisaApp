import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { Tab1PageRoutingModule } from './tab1-routing.module';
import { ExploreContainerComponent } from '../profile/explore-container.component';
import { SortListPipe } from '../pipes/sort-list.pipe';
import { CategoryPipe } from '../pipes/category.pipe';
import { FullDatePipe } from '../pipes/full-date.pipe';
import { ModePipe } from '../pipes/mode.pipe';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab1PageRoutingModule,
    SortListPipe,
    FullDatePipe,
    CategoryPipe,
    ModePipe
  ],
  declarations: [Tab1Page, ExploreContainerComponent]
})
export class Tab1PageModule { }
