import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab3Page } from './tab3.page';

import { Tab3PageRoutingModule } from './tab3-routing.module';
import { SortListPipe } from '../pipes/sort-list.pipe';
import { FullDatePipe } from '../pipes/full-date.pipe';
import { CategoryPipe } from '../pipes/category.pipe';
import { ModePipe } from '../pipes/mode.pipe';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab3PageRoutingModule,
    SortListPipe,
    FullDatePipe,
    CategoryPipe,
    ModePipe
  ],
  declarations: [Tab3Page]
})
export class Tab3PageModule { }
