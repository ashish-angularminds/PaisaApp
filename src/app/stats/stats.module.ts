import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StatsPageRoutingModule } from './stats-routing.module';
import { StatsPage } from './stats.page';
import { NgxEchartsModule } from 'ngx-echarts'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatsPageRoutingModule,
    NgxEchartsModule.forRoot({echarts: () => import('echarts')})
  ],
  declarations: [StatsPage]
})
export class StatsPageModule {}
