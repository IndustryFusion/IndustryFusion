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
import { OispDeviceStatus } from '../../../services/kairos.model';
import { UIChart } from 'primeng/chart';


@Component({
  selector: 'app-historical-status-bar-chart',
  templateUrl: './historical-status-bar-chart.component.html',
  styleUrls: ['./historical-status-bar-chart.component.scss']
})
export class HistoricalStatusBarChartComponent implements OnInit, OnChanges {

  @Input()
  statuses: OispDeviceStatus[];

  @Input()
  showAxes = false;

  @Input()
  yLabels: string[];

  @Input()
  maxXAxisValue: number;

  @ViewChild('chart') chart: UIChart;

  stackedOptions: any;
  stackedData: any;

  private isInitialized = false;
  private readonly MAX_DATASETS = 40;
  private readonly START_GROUPING_FACTOR = 4;

  constructor() {
  }

  public static getHoursString(hoursWithMinutes: number): string {
      const hours = hoursWithMinutes > 99 ? Math.floor(hoursWithMinutes) : ('00' + Math.floor(hoursWithMinutes)).slice(-2);
      const minutes = ('00' + Math.round((hoursWithMinutes - Math.floor(hoursWithMinutes)) * 60)).slice(-2);
      return `${hours}:${minutes} h`;
  }

  ngOnInit(): void {
    this.initChartOptions();
    this.initChartData();
    this.initCanvasHeight();
    this.isInitialized = true;

    this.updateChart(this.statuses);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.statuses && this.isInitialized) {
      this.updateChart(changes.statuses.currentValue);
    }
  }

  private initChartOptions() {
    const axesOptions = this.getAxesOptions();

    const tooltips = {
      mode: 'dataset',
      position: 'nearest',
      callbacks: {
        title(tooltipItem, data) {
          const value = data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index];
          const label = data.datasets[tooltipItem[0].datasetIndex].label;
          return HistoricalStatusBarChartComponent.getHoursString(value) + ' (' + label + ') - grouped data';
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
        display: false,
      },
      scales: {
        xAxes: axesOptions,
        yAxes: axesOptions
      }
    };
  }

  private getAxesOptions() {
    if (this.showAxes) {
      return [{
        stacked: true,
        display: true,
        ticks: {
          beginAtZero: true,
          fontSize: 14,
          stepSize: 2,
          max: this.maxXAxisValue ?? undefined,
          fontFamily: '\'Metropolis\', \'Avenir Next\', \'Helvetica\', serif'
        },
        gridLines: {
          display: true,
          drawOnChartArea: false
        },
      }];
    } else {
      return [{
        stacked: true,
        display: false,
        ticks: {
          beginAtZero: false
        },
        gridLines: {
          display: false
        }
      }];
    }
  }

  private initChartData() {
    this.stackedData = {
      labels: this.yLabels ?? [''],
      datasets: []
    };
  }

  private initCanvasHeight() {
    const canvasHeight = 6 + (this.showAxes ? 0.5 : 0);
    document.documentElement.style.setProperty('--canvas-height', `${ canvasHeight }rem`);
  }

  private updateChart(statuses: OispDeviceStatus[]) {
    this.updateChartData(statuses);
    this.chart?.reinit();
  }

  private updateChartData(statuses: OispDeviceStatus[]) {
    this.stackedData.datasets = [];
    if (statuses) {
      let groupSize = 1;
      let aggregatedStatuses = statuses;
      if (statuses.length > this.MAX_DATASETS * this.START_GROUPING_FACTOR) {
        groupSize = Math.floor(statuses.length / this.MAX_DATASETS);
        aggregatedStatuses = this.aggregateStatuses(statuses, groupSize);
      }

      this.addDatasetsForAggregatedStatuses(aggregatedStatuses, groupSize);
    }
  }

  private addDatasetsForAggregatedStatuses(aggregatedStatuses: OispDeviceStatus[], groupSize: number) {
    let prevStatus: OispDeviceStatus = aggregatedStatuses.length > 0 ? aggregatedStatuses[0] : null;
    let sameStatusCount = 0;

    for (const status of aggregatedStatuses) {
      if (status === prevStatus) {
        sameStatusCount++;
        // TODO (jsy): correct reduced weight of last one
      } else {
        const newDataset = this.createDatasetByStatus(prevStatus, sameStatusCount * groupSize);
        this.stackedData.datasets.push(newDataset);
        prevStatus = status;
        sameStatusCount = 1;
      }
    }
  }

  private aggregateStatuses(statuses: OispDeviceStatus[], groupSize: number): OispDeviceStatus[] {
    const aggregatedStatuses: OispDeviceStatus[] = [];
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

  private aggregateGroupOfStatuses(statuses: OispDeviceStatus[]): OispDeviceStatus {
    return this.getMode(statuses) as OispDeviceStatus;
  }

  private getMode(numbers: number[]): number {
    if (numbers.length === 0) {
      return 0;
    }

    const m = numbers.reduce((items, current) => {
      const item = (items.length === 0) ? null : items.find((x) => x.value === current);
      (item) ? item.occurrence++ : items.push({ value: current, occurrence: 1 });
      return items;
    }, [])
      .sort((a, b) => {
        if (a.occurrence < b.occurrence) {
          return 1;
        } else if (a.occurrence > b.occurrence || a.value < b.value) {
          return -1;
        } else {
          return (a.value === b.value) ? 0 : 1;
        }
      });

    return m[0].value;
  }

  private createDatasetByStatus(status: OispDeviceStatus, count: number) {
    const dataset = { type: 'horizontalBar', data: [this.maxXAxisValue / this.statuses.length * count], label: '', backgroundColor: '' };

    switch (status) {
      case OispDeviceStatus.OFFLINE:
        dataset.label = 'Offline';
        dataset.backgroundColor = '#F0F0F0';
        break;
      case OispDeviceStatus.IDLE:
        dataset.label = 'Idle';
        dataset.backgroundColor = '#454F63';
        break;
      case OispDeviceStatus.ONLINE:
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
}
