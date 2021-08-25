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

// import styles from '../../../../../../assets/sass/abstract/_variables.scss';

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

  hasStatusData = false;

  stackedOptions: any;
  stackedData: any;

  destroy$: Subject<boolean> = new Subject<boolean>();
  latestGroups$: Observable<KairosResponseGroup[]>;

  private readonly statusUpdatesPerSecond = 1.0 / (environment.assetStatusUpdateIntervalMs / 1000.0);
  private readonly secondsPerDay = 60 * 60 * 24;
  private readonly statusUpdatesPerDay = this.secondsPerDay * this.statusUpdatesPerSecond;
  private statusUpdateCountOfSelectedDay = this.statusUpdatesPerDay;

  constructor(private kairosService: KairosService) { }

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

  public static getHoursStringOfPercentage(percentage: number) {
    if (/*!this.isDateToday()*/ 1 === 1) {
      // TODO (tse): finish
      const hours = percentage / 100 * 24;
      const onlyHours = Math.floor(hours);
      const minutes = Math.round(hours - onlyHours) * 60;
      return `${onlyHours}:${minutes} h`;
    } else {
      // TODO (tse): other calculation for today
    }
  }

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
          // TODO (tse): Update and convert percentage to Hours
          title(tooltipItem, data) {
            const value = data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index];
            const label = data.datasets[tooltipItem[0].datasetIndex].label;
            return EquipmentEfficiencyBarChartComponent.getHoursStringOfPercentage(value) + ' (' + label + ')';
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.date) {
      // this.loadNewData();  // TODO: if today, update for example all 10 seconds
      this.stopDataUpdates();
      this.updateStatusUpdateCountOfSelectedDay();
      this.loadHistoricData();
    }
  }

  private updateStatusUpdateCountOfSelectedDay(): void {
    const statusUpdateCountOfTodayUntilNow = Math.round(this.getSecondsOfTodayUntilNow() * this.statusUpdatesPerSecond);
    this.statusUpdateCountOfSelectedDay = this.isDateToday() ? statusUpdateCountOfTodayUntilNow : this.statusUpdatesPerDay;
    console.log('statusUpdatesPerDay:', this.statusUpdatesPerDay);
    console.log('statusUpdateCountOfSelectedDay:', this.statusUpdateCountOfSelectedDay);
  }

  private isDateToday(): boolean {
    console.log(this.date.toDateString());
    return this.date.toDateString() === new Date(Date.now()).toDateString();
  }

  private getSecondsOfTodayUntilNow(): number {
    const midnightTodayMs = new Date(this.date.toDateString()).valueOf();
    const nowMs = Date.now().valueOf();
    return (nowMs - midnightTodayMs) / 1000;
  }

  public loadHistoricData() {
    const startDateAtMidnight = new Date(this.date.toDateString()).valueOf();
    console.log(moment(startDateAtMidnight).toISOString());
    const endDate = moment(this.date).add(1, 'days').valueOf();
    this.latestGroups$ = this.kairosService.getStatusCounts(this.asset, this.field, startDateAtMidnight, endDate, this.statusUpdatesPerDay);
    this.latestGroups$.pipe(
      takeUntil(this.destroy$),
      catchError(() => { this.hasStatusData = false; return EMPTY; })
    )
    .subscribe(
      points => {
        this.updateChart(points);
      }
    );
  }

  // TODO: add to kairos.service?
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

    const offlineCount = this.statusUpdateCountOfSelectedDay - pointsOfAllStatiExceptOffline;
    return Math.round(offlineCount);
  }

  private sumOfResults(group: KairosResponseGroup) {
    let count = 0;
    group.results.forEach(result => count += result);
    return count;
  }

  private updateChart(statusGroupsExcludingOffline: KairosResponseGroup[]) {
    if (statusGroupsExcludingOffline.length > 0) {
      this.hasStatusData = true;

      const estimatedOfflineCount = this.calculateOfflineStatusCount(statusGroupsExcludingOffline);
      const offlineGroup: KairosResponseGroup = ({ index: OispDeviceStatus.OFFLINE, results: [estimatedOfflineCount] });
      const statusGroups: KairosResponseGroup[] = [ ...statusGroupsExcludingOffline];
      statusGroups.unshift(offlineGroup);

      console.log('statusGroups:');
      statusGroups.forEach(group => {
        console.log(group);
        const roundedPercentage = Math.round(this.sumOfResults(group) / this.statusUpdateCountOfSelectedDay * 100);
        console.log('percentage', roundedPercentage);
        this.stackedData.datasets[EquipmentEfficiencyBarChartComponent.getDatasetIndexFromStatus(group.index)].data = roundedPercentage;
      });

      this.chart?.reinit();
    } else {
      this.hasStatusData = false;
    }
  }

  ngOnDestroy() {
   this.stopDataUpdates();
  }

  private stopDataUpdates() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
