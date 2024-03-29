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

import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UIChart } from 'primeng/chart';
import { EquipmentEfficiencyBarChartComponent } from '../equipment-efficiency-bar-chart/equipment-efficiency-bar-chart.component';
import { StatusHours } from '../../../../core/models/kairos-status-aggregation.model';
import { DeviceStatus } from '../../../../core/models/kairos.model';
import { EnumHelpers } from '../../../../core/helpers/enum-helpers';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-equipment-efficiency-overview-donut-chart',
  templateUrl: './equipment-efficiency-overview-donut-chart.component.html',
  styleUrls: ['./equipment-efficiency-overview-donut-chart.component.scss']
})
export class EquipmentEfficiencyOverviewDonutChartComponent implements OnInit {

  @Input()
  aggregatedStatusHours$: BehaviorSubject<StatusHours[]>;

  @Input()
  title: string;

  @ViewChild('chart') chart: UIChart;

  statusHoursPercentage: number[] = [0, 0, 0, 0];
  DeviceStatus = DeviceStatus;

  data: any;
  chartOptions: any;

  constructor(private enumHelpers: EnumHelpers) {
    this.initChartOptions();
    this.initChartData();
  }

  private static getDatasetIndexOfStatus(status: DeviceStatus): 0 | 1 | 2 | 3 {
    switch (status) {
      case DeviceStatus.RUNNING:
        return 0;
      case DeviceStatus.OFFLINE:
        return 1;
      case DeviceStatus.ERROR:
        return 2;
      case DeviceStatus.IDLE:
        return 3;
    }
  }

  private initChartOptions() {
    const tooltips = {
      mode: 'index',
      position: 'nearest',
      callbacks: {
        title(tooltipItem, data) {
          const value = data.datasets[0].data[tooltipItem[0].index];
          const label = data.labels[tooltipItem[0].index];
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

    this.chartOptions = {
      tooltips,
      animation: false,
      responsive: true,
      cutoutPercentage: 66.66,
      legend: {
        display: false
      },
      plugins: {
        legend: {
          labels: {
            color: '#ebedef'
          }
        }
      }
    };
  }

  private initChartData() {
    this.data = {
      labels: ['Running', 'Offline', 'Error', 'Idle'],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: [
          '#2CA9CE',
          '#EAEAEA',
          '#A73737',
          '#454F63'
        ],
        borderWidth: 0,
      }]
    };
  }

  ngOnInit() {
    this.aggregatedStatusHours$.subscribe(aggregatedStatusHours => {
      if (aggregatedStatusHours) {
        this.updateChart(aggregatedStatusHours);
      }
    });
  }

  private updateChart(totalStatusHours: StatusHours[]) {
    this.resetChartData();
    this.setChartData(totalStatusHours);
    this.updateLegend(totalStatusHours);
    this.chart?.reinit();
  }

  private resetChartData() {
    for (let i = 0; i < this.enumHelpers.getIterableArray(DeviceStatus).length; i++) {
      this.data.datasets[0].data[i] = 0;
      this.statusHoursPercentage[i] = 0;
    }
  }

  private setChartData(totalStatusHours: StatusHours[]): void {
    if (totalStatusHours) {
      totalStatusHours.forEach(statusHour => {
        const index = EquipmentEfficiencyOverviewDonutChartComponent.getDatasetIndexOfStatus(statusHour.status);
        this.data.datasets[0].data[index] = statusHour.hours;
      });
    }
  }

  private updateLegend(totalStatusHours: StatusHours[]): void {
    if (totalStatusHours) {
      const totalSum = totalStatusHours.map(x => x.hours).reduce((accumulator, currentValue) => accumulator + currentValue);
      totalStatusHours.forEach(statusHour => {
        this.statusHoursPercentage[statusHour.status] = Math.round(statusHour.hours / totalSum * 100.0);
      });
    }
  }
}
