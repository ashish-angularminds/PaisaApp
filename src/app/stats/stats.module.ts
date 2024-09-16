import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StatsPageRoutingModule } from './stats-routing.module';
import { StatsPage } from './stats.page';
import { BaseChartDirective } from 'ng2-charts';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatsPageRoutingModule,
    BaseChartDirective
  ],
  declarations: [StatsPage],
  providers:[provideCharts(withDefaultRegisterables())],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class StatsPageModule {}
