/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Component, Input, OnInit } from '@angular/core';
import { FactoryAssetDetailsWithFields } from 'src/app/store/factory-asset-details/factory-asset-details.model';

// import styles from '../../../../../../assets/sass/abstract/_variables.scss';

@Component({
  selector: 'app-equipment-efficiency-bar-chart',
  templateUrl: './equipment-efficiency-bar-chart.component.html',
  styleUrls: ['./equipment-efficiency-bar-chart.component.scss']
})
export class EquipmentEfficiencyBarChartComponent implements OnInit {

  @Input()
  asset: FactoryAssetDetailsWithFields;

  @Input()
  date: Date;

  noMaintenanceValue: boolean;

  stackedOptions: any;
  stackedData: any;

  constructor() { }

  ngOnInit(): void {
    this.initOptions();
  }

  private initOptions() {
    this.stackedOptions = {
      tooltips: {
        mode: 'dataset',
        position: 'nearest',
    /*    mode: 'label',
        intersect: true,*/
        callbacks: {
          title(tooltipItem, data) {
            const value = data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index];
            const label = data.datasets[tooltipItem[0].datasetIndex].label;
            return value + ':02 h (' + label + ')';
          },
          label(_, _2) {
            return '';
          },
        },
        backgroundColor: '#000000',
        titleFontSize: 16,
        titleFontColor: '#FFFFFF',
        bodyFontColor: '#FFFFFF',
        bodyFontSize: 12,
        displayColors: false,
        xAlign: 'center',
      },
      animation: false,
      maintainAspectRatio: false,
      responsive: true,
      layout: {
        padding: {
          bottom: 22,
          right: 50
        }
      },
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          stacked: true,
          display: false,
          ticks: {
            beginAtZero: false
          },
          gridLines: {
            display: false
          }
        }],
        yAxes: [{
          stacked: true,
          display: false,
          ticks: {
            beginAtZero: false
          },
          gridLines: {
            display: false
          }
        }]
      }
    };

    // TODO: Use colours from style
    this.stackedData = {
      labels: ['January'],
      datasets: [{
        type: 'horizontalBar',
        label: 'Offline',
        backgroundColor: '#F0F0F0', // styles.statusErrorColor,
        data: [
          15,
        ]
      }, {
        type: 'horizontalBar',
        label: 'Idle',
        backgroundColor: '#454F63',  // styles.statusIdleColor,
        data: [
          10,
        ]
      }, {
        type: 'horizontalBar',
        label: 'Error',
        backgroundColor: '#A73737', // styles.statusErrorColor,
        data: [
          5,
        ]
      },
      {
        type: 'horizontalBar',
        label: 'Running',
        backgroundColor: '#2CA9CE', // styles.statusRunningColor,
        data: [
          70,
        ]
      }]
    };
  }

}
