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
import { OispDeviceStatus } from '../../../services/api/kairos.model';
import { UIChart } from 'primeng/chart';
import * as moment from 'moment';
import { StatusPoint } from '../../../factory/models/status.model';
import { environment } from '../../../../environments/environment';
import { EquipmentEfficiencyBarChartComponent } from '../equipment-efficiency-bar-chart/equipment-efficiency-bar-chart.component';


@Component({
  selector: 'app-historical-status-bar-chart',
  templateUrl: './historical-status-bar-chart.component.html',
  styleUrls: ['./historical-status-bar-chart.component.scss']
})
export class HistoricalStatusBarChartComponent implements OnInit, OnChanges {

  @Input()
  statuses: StatusPoint[];

  @ViewChild('chart') chart: UIChart;

  stackedOptions: any;
  stackedData: any;

  private isInitialized = false;
  private readonly MAX_DATASETS = 80;
  private readonly START_GROUPING_DATASET_COUNT = 80;

  constructor() {
  }

  private static createDatasetByStatus(firstStatusPointOfGroup: StatusPoint, timeOfStartOfNextGroup: moment.Moment) {
    const durationSec = (timeOfStartOfNextGroup.toDate().valueOf() - firstStatusPointOfGroup.time.toDate().valueOf()) / 1000.0;
    const dataset = { type: 'horizontalBar', data:  [ { x: durationSec, t: firstStatusPointOfGroup.time } ],
      label: '', backgroundColor: '' };

    switch (firstStatusPointOfGroup.status) {
      case OispDeviceStatus.OFFLINE:
        dataset.label = 'Offline';
        dataset.backgroundColor = '#EAEAEA';
        break;
      case OispDeviceStatus.IDLE:
        dataset.label = 'Idle';
        dataset.backgroundColor = '#454F63';
        break;
      case OispDeviceStatus.RUNNING:
        dataset.label = 'Running';
        dataset.backgroundColor = '#2CA9CE';
        break;
      case OispDeviceStatus.ERROR:
        dataset.label = 'Error';
        dataset.backgroundColor = '#A73737';
        break;
    }

    return dataset;
  }

  private static fillOfflineGaps(statuses: StatusPoint[]): StatusPoint[] {
    if (statuses && statuses.length > 0) {
      const additionalStatuses: StatusPoint[] = [];
      let prevTime = statuses[0].time;

      for (const status of statuses) {
        const timeDifference = status.time.valueOf() - prevTime.valueOf();

        if (timeDifference > environment.assetStatusSampleRateMs * 2) {
          for (let i = 1; i <= Math.floor(timeDifference / environment.assetStatusSampleRateMs - 1); i++) {
            additionalStatuses.push({
              status: OispDeviceStatus.OFFLINE,
              time: moment(prevTime.valueOf() + environment.assetStatusSampleRateMs * i) }
            );
          }
        }

        prevTime = status.time;
      }

      if (additionalStatuses.length > 0) {
        statuses.concat(additionalStatuses);
        statuses = statuses.sort((a, b) => a.time.valueOf() - b.time.valueOf());
      }
    }

    return statuses;
  }

  ngOnInit(): void {
    this.initChartOptions();
    this.initChartData();
    this.isInitialized = true;

    this.updateChart(this.statuses);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.statuses && this.isInitialized) {
      this.updateChart(changes.statuses.currentValue);
    }
  }

  private initChartOptions() {
    const axes = { stacked: true, display: false };

    const tooltips = {
      mode: 'dataset',
      position: 'nearest',
      callbacks: {
        title(tooltipItem, data) {
          const timestamp: moment.Moment = data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index].t;
          const durationSec = Math.round(data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index].x);
          const durationMin = Math.round(durationSec / 60);
          const durationHoursNotRounded = durationMin / 60;
          const label = data.datasets[tooltipItem[0].datasetIndex].label;

          const durationHoursText = EquipmentEfficiencyBarChartComponent.getHoursString(durationHoursNotRounded);
          const durationText = durationMin > 59 ? durationHoursText : durationSec > 99 ? durationMin + ' min' : durationSec + 'sec';
          return timestamp.format('d.M, HH:mm') + ' | ca. ' + durationText + ' (' + label + ')';
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
          right: 30
        }
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [axes],
        yAxes: [axes]
      }
    };
  }

  private initChartData() {
    this.stackedData = {
      labels: [''],
      datasets: []
    };
  }

  private updateChart(statuses: StatusPoint[]) {
    this.flushData();
    this.updateChartData(statuses);
    this.chart?.reinit();
  }

  private flushData(): void {
    if (this.chart) {
      this.chart.data.datasets = [];
      this.chart.refresh();
    }
  }

  private updateChartData(statuses: StatusPoint[]) {
    this.stackedData.datasets = [];
    if (statuses && statuses.length > 0) {
      statuses = HistoricalStatusBarChartComponent.fillOfflineGaps(statuses);

      let aggregatedStatuses: StatusPoint[] = statuses;
      if (statuses.length > this.START_GROUPING_DATASET_COUNT) {
        const groupSize = Math.floor(statuses.length / this.MAX_DATASETS);
        aggregatedStatuses = this.aggregateStatuses(statuses, groupSize);
      }

      this.addDatasetsForAggregatedStatuses(aggregatedStatuses);
    }
  }

  private addDatasetsForAggregatedStatuses(aggregatedStatuses: StatusPoint[]) {
    let firstStatusPointOfGroup: StatusPoint = aggregatedStatuses.length > 0 ? aggregatedStatuses[0] : null;

    for (const statusPoint of aggregatedStatuses) {
      if (statusPoint.status !== firstStatusPointOfGroup.status) {
        this.addStatusToDataset(firstStatusPointOfGroup, statusPoint.time);
        firstStatusPointOfGroup = statusPoint;
      }
    }

    // Cases: 1) Only 1 point -> initial status == status[0], therefore not added above -> add
    // 2) last point has same status than some points before -> add last group
    // 3) single last point -> not added, because adding excludes current point and marks the start of a new group -> same as 1)
    // -> We always have to add a last group
    if (aggregatedStatuses.length > 0) {
      const lastStatusPoint = aggregatedStatuses[aggregatedStatuses.length - 1];
      const timeOfLastStatusPointPlusOneSample = moment(lastStatusPoint.time.toDate().valueOf() + environment.assetStatusSampleRateMs);
      this.addStatusToDataset(firstStatusPointOfGroup, timeOfLastStatusPointPlusOneSample);
    }
  }

  private addStatusToDataset(firstStatusPointOfGroup: StatusPoint, timeOfFirstStatusPointOfNextGroup: moment.Moment) {
    const newDataset = HistoricalStatusBarChartComponent.createDatasetByStatus(firstStatusPointOfGroup, timeOfFirstStatusPointOfNextGroup);
    this.stackedData.datasets.push(newDataset);
  }

  private aggregateStatuses(statuses: StatusPoint[], groupSize: number): StatusPoint[] {
    const aggregatedStatuses: StatusPoint[] = [];
    if (statuses) {
      const statusGroups = this.getStatusGroups(statuses, groupSize);
      for (const statusGroup of statusGroups) {
        aggregatedStatuses.push(this.aggregateGroupOfStatuses(statusGroup));
      }
    }

    return aggregatedStatuses;
  }

  private getStatusGroups<T>(items: T[], groupSize: number): T[][] {
    return items.reduce((chunks: T[][], item: T, index) => {
      const chunk = Math.floor(index / groupSize);
      chunks[chunk] = ([] as T[]).concat(chunks[chunk] || [], item);
      return chunks;
    }, []);
  }

  private aggregateGroupOfStatuses(statuses: StatusPoint[]): StatusPoint {
    const modeOfStatusGroup = this.getMode(statuses.map(status => status.status)) as OispDeviceStatus;
    const firstTimeOfGroup = statuses[0].time;
    return { status: modeOfStatusGroup, time: firstTimeOfGroup };
  }

  private getMode(statuses: OispDeviceStatus[]): OispDeviceStatus {
    if (statuses.length === 0) {
      return 0;
    }

    const statusesWithCount: { value: OispDeviceStatus, count: number }[] = statuses.reduce((items, current) => {
      const item = (items.length === 0) ? null : items.find((x) => x.value === current);
      (item) ? item.count++ : items.push({ value: current, count: 1 });
      return items;
    }, []);

    const statusesWithDescendingCount = statusesWithCount.sort((a, b) => {
        if (a.count < b.count) {
          return 1;
        } else if (a.count > b.count || a.value < b.value) {
          return -1;
        } else {
          return (a.value === b.value) ? 0 : 1;
        }
      });

    return statusesWithDescendingCount[0].value;
  }
}
