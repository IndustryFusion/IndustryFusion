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

import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { OispDeviceStatus } from '../../../../../services/kairos.model';
import { UIChart } from 'primeng/chart';
import { EnumHelpers } from '../../../../../common/utils/enum-helpers';
import { StatusHours } from '../../../../../services/kairos-status-aggregation.model';


@Component({
  selector: 'app-equipment-efficiency-bar-chart',
  templateUrl: './equipment-efficiency-bar-chart.component.html',
  styleUrls: ['./equipment-efficiency-bar-chart.component.scss']
})
export class EquipmentEfficiencyBarChartComponent implements OnInit, OnChanges {

  @Input()
  assetStatusHours: StatusHours[];

  @ViewChild('chart') chart: UIChart;

  stackedOptions: any;
  stackedData: any;

  constructor(private enumHelpers: EnumHelpers) {
    this.initChartOptions();
    this.initChartData();
  }

  private static getDatasetIndexOfStatus(status: OispDeviceStatus): 0 | 1 | 2 | 3 {
    switch (status) {
      case OispDeviceStatus.OFFLINE:
        return 0;
      case OispDeviceStatus.ERROR:
        return 1;
      case OispDeviceStatus.IDLE:
        return 2;
      case OispDeviceStatus.ONLINE:
        return 3;
    }
  }

  public static getHoursString(hoursWithMinutes: number) {
      const hours = hoursWithMinutes > 99 ? Math.floor(hoursWithMinutes) : ('00' + Math.floor(hoursWithMinutes)).slice(-2);
      const minutes = ('00' + Math.round((hoursWithMinutes - Math.floor(hoursWithMinutes)) * 60)).slice(-2);
      return `${hours}:${minutes} h`;
  }

  ngOnInit(): void {
    this.updateChart(this.assetStatusHours);
  }

  private initChartOptions() {
    const axesOptions = [{
      stacked: true,
      display: false,
      ticks: {
        beginAtZero: false
      },
      gridLines: {
        display: false
      }
    }];

    const tooltips = {
      mode: 'dataset',
      position: 'nearest',
      callbacks: {
        title(tooltipItem, data) {
          const value = data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index];
          const label = data.datasets[tooltipItem[0].datasetIndex].label;
          return EquipmentEfficiencyBarChartComponent.getHoursString(value) + ' (' + label + ')';
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
    };

    this.stackedOptions = {
      tooltips,
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
        xAxes: axesOptions,
        yAxes: axesOptions
      }
    };
  }

  private initChartData() {
    this.stackedData = {
      labels: [''],
      datasets: [{
        type: 'horizontalBar',
        label: 'Offline',
        backgroundColor: '#F0F0F0',
        data: [ 0 ]
      }, {
        type: 'horizontalBar',
        label: 'Error',
        backgroundColor: '#A73737',
        data: [ 0 ]
      }, {
        type: 'horizontalBar',
        label: 'Idle',
        backgroundColor: '#454F63',
        data: [ 0 ]
      },
        {
          type: 'horizontalBar',
          label: 'Running',
          backgroundColor: '#2CA9CE',
          data: [ 0 ]
        }]
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.assetStatusHours) {
      this.updateChart(changes.assetStatusHours.currentValue);
    }
  }

  private updateChart(assetStatusHours: StatusHours[]) {
    this.resetChartData();
    this.setChartData(assetStatusHours);
    this.chart?.reinit();
  }

  private resetChartData() {
    for (let i = 0; i < this.enumHelpers.getIterableArray(OispDeviceStatus).length; i++) {
      this.stackedData.datasets[i].data = [0];
    }
  }

  private setChartData(assetStatusHours: StatusHours[]) {
    if (assetStatusHours) {
      assetStatusHours.forEach(statusHour => {
        const index = EquipmentEfficiencyBarChartComponent.getDatasetIndexOfStatus(statusHour.status);
        this.stackedData.datasets[index].data = [statusHour.hours];
      });
    }
  }
}
