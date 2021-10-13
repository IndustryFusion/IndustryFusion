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
import { StatusHours } from '../../../services/kairos-status-aggregation.model';
import { OispDeviceStatus } from '../../../services/kairos.model';
import { EnumHelpers } from '../../../common/utils/enum-helpers';
import { BehaviorSubject } from 'rxjs';
import { FieldDetails } from '../../../store/field-details/field-details.model';
import { Asset } from '../../../store/asset/asset.model';

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.scss']
})
export class GaugeChartComponent implements OnInit {

  @Input()
  aggregatedStatusHours$: BehaviorSubject<StatusHours[]>;

  @Input()
  fieldDetail: FieldDetails;

  @Input()
  metricValue: number | string;

  @Input()
  asset: Asset;

  @Input()
  title: string;

  @ViewChild('chart') chart: UIChart;

  statusHoursPercentage: number[] = [0, 0, 0, 0];
  OispDeviceStatus = OispDeviceStatus;

  data: any;
  chartOptions: any;

  constructor(private enumHelpers: EnumHelpers) {
    this.initChartOptions();
    this.initChartData();
  }

  private static getDatasetIndexOfStatus(status: OispDeviceStatus): 0 | 1 | 2 | 3 {
    switch (status) {
      case OispDeviceStatus.ONLINE:
        return 0;
      case OispDeviceStatus.OFFLINE:
        return 1;
      case OispDeviceStatus.ERROR:
        return 2;
      case OispDeviceStatus.IDLE:
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
      cutoutPercentage: 80,
      rotation: -Math.PI,
      circumference: Math.PI,
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
        data: [20, 10, 24, 2, 24, 10, 20],
        backgroundColor: [
          '#A73737',
          '#FCA82B',
          '#2CA9CE',
          '#000000',
          '#2CA9CE',
          '#FCA82B',
          '#A73737',
          /*'#F0F0F0',*/
        ],
        borderWidth: 0,
      }]
    };
  }

  ngOnInit() {
    this.aggregatedStatusHours$?.subscribe(aggregatedStatusHours => {
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
    for (let i = 0; i < this.enumHelpers.getIterableArray(OispDeviceStatus).length; i++) {
      this.data.datasets[0].data[i] = 0;
      this.statusHoursPercentage[i] = 0;
    }
  }

  private setChartData(totalStatusHours: StatusHours[]): void {
    if (totalStatusHours) {
      totalStatusHours.forEach(statusHour => {
        const index = GaugeChartComponent.getDatasetIndexOfStatus(statusHour.status);
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
