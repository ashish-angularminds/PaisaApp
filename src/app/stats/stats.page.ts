import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ChartData, ChartDataset, ChartOptions, Plugin } from 'chart.js';
import { Chart } from 'chart.js/dist';
import * as helpers from 'chart.js/helpers';
import { register } from 'swiper/element/bundle';
import { backgroundConfig } from './charts/dailyRadex';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsPage implements OnInit {


  constructor() { }

  ngOnInit() {
    register();
  }

  pieChartOptions: ChartOptions<'polarArea'> = {
    borderColor:'#00000000',
    backgroundColor: (context: any) => backgroundConfig(context),
    plugins: {
      legend: {
        display:false,
      },

    },
    scales: {
      r: {
        ticks:{
          display: false
        },
        grid: {
          display:false
        }
      },

    },
    layout: {
      autoPadding:true,
    },
    elements:{
      arc:{
        borderRadius:5,
      },
    },
    
  };
  public pieChartLabels = ['A', 'B', 'C', 'D', 'E'];
  public pieChartDatasets:ChartDataset<'polarArea'> = {
    data:[300, 500, 400, 500, 250],
    type: 'polarArea',
    spacing: 1,
  };
  public pieChartLegend = true;

  // pieChartPlugins:Plugin<'polarArea'> = {
  //   id:'test'
  // }
}
