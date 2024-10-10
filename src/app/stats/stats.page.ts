import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChartData, ChartDataset, ChartOptions, Plugin } from 'chart.js';
import { Chart } from 'chart.js/dist';
import * as helpers from 'chart.js/helpers';
import { register } from 'swiper/element/bundle';
import { backgroundConfig } from './charts/dailyRadex';
import { transactionType } from '../store/type/transaction.interface';
import { Store } from '@ngrx/store';
import { initalUserStateInterface } from '../store/type/InitialUserState.interface';
import { selectState } from '../store/selectors';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsPage implements OnInit {

  constructor(private store: Store<initalUserStateInterface>, private changeDetector: ChangeDetectorRef) { }

  foodSpentAmount = 0;
  shoppingSpentAmount = 0;
  travelSpentAmount = 0;
  medicalSpentAmount = 0;
  otherSpentAmount = 0;
  account: any;
  newDate = new Date();

  ngOnInit() {
    this.store.select(selectState).subscribe((data: initalUserStateInterface) => {
      if (data) {
        // this.user = { ...data };
        [this.account] = Object.values(data.accounts).filter((acc: any) => acc?.month === this.newDate.getMonth() + 1 && acc.year === this.newDate.getFullYear());
      }
      this.initializeData();
    });

    // register();
  }

  initializeData() {
    this.foodSpentAmount = 0;
    this.shoppingSpentAmount = 0;
    this.travelSpentAmount = 0;
    this.medicalSpentAmount = 0;
    this.otherSpentAmount = 0;
    this.account.transactions?.forEach((data: any) => {
      if (data.type === transactionType.Debit) {
        switch (data.category) {
          case 0:
            this.foodSpentAmount = this.foodSpentAmount + data.amount!;
            break;
          case 1:
            this.shoppingSpentAmount = this.shoppingSpentAmount + data.amount!;
            break;
          case 2:
            this.travelSpentAmount = this.travelSpentAmount + data.amount!;
            break;
          case 3:
            this.medicalSpentAmount = this.medicalSpentAmount + data.amount!;
            break;
          case 4:
            this.otherSpentAmount = this.otherSpentAmount + data.amount!;
            break;
          default:
            break;
        }
      }
    });
    this.pieChartDatasets = {
      type: 'polarArea',
      spacing: 1,
      data: [this.foodSpentAmount,
      this.shoppingSpentAmount,
      this.travelSpentAmount,
      this.medicalSpentAmount,
      this.otherSpentAmount]
    }
    this.changeDetector.detectChanges();
  }

  pieChartOptions: ChartOptions<'polarArea'> = {
    borderColor: '#00000000',
    backgroundColor: (context: any) => backgroundConfig(context),
    plugins: {
      legend: {
        display: false,
      },

    },
    scales: {
      r: {
        ticks: {
          display: false
        },
        grid: {
          display: false
        }
      },

    },
    layout: {
      autoPadding: true,
    },
    elements: {
      arc: {
        borderRadius: 5,
      },
    },

  };
  public pieChartLabels = [
    'food',
    'shopping',
    'travel',
    'medical',
    'other'];
  public pieChartDatasets: ChartDataset<'polarArea'> = {
    data: [this.foodSpentAmount,
    this.shoppingSpentAmount,
    this.travelSpentAmount,
    this.medicalSpentAmount,
    this.otherSpentAmount],
    type: 'polarArea',
    spacing: 1,
  };
  public pieChartLegend = true;

  // pieChartPlugins:Plugin<'polarArea'> = {
  //   id:'test'
  // }
}
