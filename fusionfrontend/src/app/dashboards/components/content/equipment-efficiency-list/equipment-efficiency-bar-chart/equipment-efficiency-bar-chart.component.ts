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

import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FactoryAssetDetailsWithFields } from 'src/app/store/factory-asset-details/factory-asset-details.model';
import { catchError, takeUntil } from 'rxjs/operators';
import { EMPTY, Observable, Subject } from 'rxjs';
import { FieldDetails } from '../../../../../store/field-details/field-details.model';
import * as moment from 'moment';
import { KairosService } from '../../../../../services/kairos.service';
import { KairosResponseGroup, OispDeviceStatus } from '../../../../../services/kairos.model';
import { environment } from '../../../../../../environments/environment';
import { UIChart } from 'primeng/chart';
import { EnumHelpers } from '../../../../../common/utils/enum-helpers';


@Component({
  selector: 'app-equipment-efficiency-bar-chart',
  templateUrl: './equipment-efficiency-bar-chart.component.html',
  styleUrls: ['./equipment-efficiency-bar-chart.component.scss']
})
export class EquipmentEfficiencyBarChartComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  asset: FactoryAssetDetailsWithFields;

  @Input()
  field: FieldDetails;

  @Input()
  date: Date;

  @ViewChild('chart') chart: UIChart;

  stackedOptions: any;
  stackedData: any;

  destroy$: Subject<boolean> = new Subject<boolean>();
  latestGroups$: Observable<KairosResponseGroup[]>;

  private readonly statusUpdatesPerSecond = 1.0 / (environment.assetStatusUpdateIntervalMs / 1000.0);
  private readonly secondsPerHour = 60 * 60;
  private readonly hoursPerDay = 24;

  constructor(private kairosService: KairosService, private enumHelpers: EnumHelpers) {
    this.initOptions();
  }

  public static getDatasetIndexFromStatus(status: OispDeviceStatus) {
    switch (status) {
      case OispDeviceStatus.OFFLINE:
        return 0;
      case OispDeviceStatus.IDLE:
        return 1;
      case OispDeviceStatus.ONLINE:
        return 3;
      case OispDeviceStatus.ERROR:
        return 2;
    }
  }

  public static getHoursString(hours: number) {
      const onlyHours = ('00' + Math.floor(hours)).slice(-2);
      const minutes = ('00' + Math.round((hours - Math.floor(hours)) * 60)).slice(-2);
      return `${onlyHours}:${minutes} h`;
  }

  ngOnInit(): void {
    this.updateChart([]);
  }

  private initOptions() {
    this.stackedOptions = {
      tooltips: {
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

    this.stackedData = {
      labels: ['January'],
      datasets: [{
        type: 'horizontalBar',
        label: 'Offline',
        backgroundColor: '#F0F0F0',
        data: [
          24,
        ]
      }, {
        type: 'horizontalBar',
        label: 'Idle',
        backgroundColor: '#454F63',
        data: [
          0,
        ]
      }, {
        type: 'horizontalBar',
        label: 'Error',
        backgroundColor: '#A73737',
        data: [
          0,
        ]
      },
      {
        type: 'horizontalBar',
        label: 'Running',
        backgroundColor: '#2CA9CE',
        data: [
          0,
        ]
      }]
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.date) {
      this.stopDataUpdates();
      this.loadHistoricData();
    }
  }

  private isDateToday(): boolean {
    return this.date.toDateString() === new Date(Date.now()).toDateString();
  }

  private getSecondsOfTodayUntilNow(): number {
    const midnightTodayMs = new Date(this.date.toDateString()).valueOf();
    const nowMs = Date.now().valueOf();
    return (nowMs - midnightTodayMs) / 1000;
  }

  public loadHistoricData() {
    const startDateAtMidnight = new Date(this.date.toDateString()).valueOf();
    const endDate = moment(this.date).add(1, 'days').valueOf();
    this.latestGroups$ = this.kairosService.getStatusCounts(
      this.asset, this.field, startDateAtMidnight, endDate, this.getStatusUpdatesPerDay()
    );
    this.latestGroups$.pipe(
      takeUntil(this.destroy$),
      catchError(() => EMPTY)
    )
    .subscribe(
      points => {
        this.updateChart(points);
      }
    );
  }

  private calculateOfflineStatusCount(groups: KairosResponseGroup[]): number {
    // Idea: As devices sent all status messages except offline  (apart from few potential 0 at shutdown) in a more or less period interval
    // we can derive the offline count by subtracting the expected messages of the selected day (or until now if today)
    // from the sum of status idle, online and error.
    let pointsOfAllStatiExceptOffline = 0;
    groups.forEach(group => {
      if (group.index !== OispDeviceStatus.OFFLINE) {
        pointsOfAllStatiExceptOffline += this.sumOfResults(group);
      }
    });

    const offlineCount = this.getStatusUpdatesPerDay() - pointsOfAllStatiExceptOffline;
    return Math.round(offlineCount);
  }

  private sumOfResults(group: KairosResponseGroup) {
    let count = 0;
    group.results.forEach(result => count += result);
    return count;
  }

  private updateChart(statusGroupsExcludingOffline: KairosResponseGroup[]) {
    const estimatedOfflineCount = this.calculateOfflineStatusCount(statusGroupsExcludingOffline);
    const offlineGroup: KairosResponseGroup = ({ index: OispDeviceStatus.OFFLINE, results: [estimatedOfflineCount] });
    const statusGroups: KairosResponseGroup[] = [ ...statusGroupsExcludingOffline];
    statusGroups.unshift(offlineGroup);

    this.resetChartData();
    this.setChartData(statusGroups);
    this.chart?.reinit();
  }

  private resetChartData() {
    for (let i = 0; i < this.enumHelpers.getIterableArray(OispDeviceStatus).length; i++) {
      this.stackedData.datasets[i].data = [0];
    }
  }

  private setChartData(statusGroups: KairosResponseGroup[]) {
    statusGroups.forEach(group => {
      const hours = (this.sumOfResults(group) / this.statusUpdatesPerSecond) / this.secondsPerHour;
      this.stackedData.datasets[EquipmentEfficiencyBarChartComponent.getDatasetIndexFromStatus(group.index)].data = [hours];
    });
  }

  private secondsOfDay() {
    let hoursOfDay: number;
    if (this.isDateToday()) {
      hoursOfDay = this.getSecondsOfTodayUntilNow() ;
    } else {
      hoursOfDay = this.hoursPerDay * (this.secondsPerHour);
    }
    return hoursOfDay;
  }

  private getStatusUpdatesPerDay(): number {
    return this.secondsOfDay() * this.statusUpdatesPerSecond;
  }


  ngOnDestroy() {
   this.stopDataUpdates();
  }

  private stopDataUpdates() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
