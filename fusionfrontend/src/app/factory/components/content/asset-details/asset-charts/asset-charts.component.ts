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
import { ChartDataSets, ChartOptions, ChartPoint } from 'chart.js';
import { BaseChartDirective, Color, Label } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { Observable, Subject, timer } from 'rxjs';
import { FieldDetails } from 'src/app/store/field-details/field-details.model';
import { Asset } from 'src/app/store/asset/asset.model';
import { OispService } from 'src/app/services/oisp.service';
import * as moment from 'moment';
import { PointWithId } from '../../../../../services/oisp.model';
import { switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-asset-charts',
  templateUrl: './asset-charts.component.html',
  styleUrls: ['./asset-charts.component.scss']
})
export class AssetChartsComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  field: FieldDetails;

  @Input()
  asset: Asset;

  @Input()
  options: string;

  @Input()
  maxPointsOptions: string;

  @Input()
  clickedOk: boolean;

  @Input()
  startDate: moment.Moment;

  @Input()
  endDate: moment.Moment;

  name: string;

  initialized = false;

  currentNumberOfPoints = 0;

  currentTimestamps: number[] = [];

  lastReceivedTimestamp = 0;

  slidingTimeWindow = 0;

  destroy$: Subject<boolean> = new Subject<boolean>();

  latestPoints$: Observable<PointWithId[]>;

  public lineChartData: ChartDataSets[] = [
    { data: [], label: '', fill: false, borderWidth: 2 },
  ];
  public lineChartLabels: Label[] = [];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        type: 'time',
        distribution: 'series',
        time: {
              parser: 'MM/DD/YYYY HH:mm',
              tooltipFormat: 'll HH:mm',
              unit: 'day',
              unitStepSize: 1,
              displayFormats: {
                day: 'MM/DD/YYYY HH:mm'
              }
              },
        ticks: {
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
          maxTicksLimit: 10
        }
      }],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
        }
      ]
    },
    elements: {
      line: {
        borderWidth: 1
      },
      point: {
        radius: 1
      }
    },
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: 'March',
          borderColor: 'blue',
          borderWidth: 2,
          label: {
            enabled: true,
            fontColor: 'orange',
            content: 'LineAnno'
          }
        },
      ],
    },
  };
  public lineChartColors: Color[] = [
    { // blue
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: '#0079AD',
      /*pointBackgroundColor: 'orange',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'*/
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // red
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [pluginAnnotations];

  @ViewChild(BaseChartDirective, { static: false }) chart: BaseChartDirective;

  constructor(
    private oispService: OispService) { }

  ngOnInit() {
    this.lineChartData[0].label = this.field.description;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialized) {
      if (changes.options) {
        switch ( this.options ){
            case 'current':
              this.flushData();
              this.loadNewData();
              break;
            case '1hour':
              this.flushData();
              break;
            case '1day':
              this.flushData();
              break;
            case 'customDate':
              this.flushData();
              break;
            default:
              break;
          }
      }
      if (changes.clickedOk) {
        if (this.clickedOk) {
          switch ( this.options ) {
            case '1hour':
              this.loadHistoricData(this.maxPointsOptions, false, 3600);
              break;
            case '1day':
              this.loadHistoricData(this.maxPointsOptions, false, 86400);
              break;
            case 'customDate':
              this.loadHistoricData(this.maxPointsOptions, true);
              break;
            default:
              break;
          }
        }
      }
    } else {
      this.initialized = true;
      this.loadNewData();
    }
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  flushData() {
    this.lineChartData[0].data = [];
    this.lineChartLabels = [];
    this.currentTimestamps = [];
    this.currentNumberOfPoints = 0;
    this.lastReceivedTimestamp = 0;
    this.destroy$.next(true);
  }

  loadNewData() {
    let gotFirstPoints = false;
    let currentTime = moment().valueOf();
    let startTime = currentTime - 600000;
    this.latestPoints$ = timer(0, 5000)
        .pipe(
          switchMap(() => {
            // If we already received some points, only take points from last 5 seconds.
            if (gotFirstPoints) {
              currentTime = moment().valueOf();
              startTime = currentTime - 5000;
              return this.oispService.getValuesOfSingleFieldByDates(this.asset, this.field, startTime, currentTime, '1');
            } else {
              gotFirstPoints = true;
              return this.oispService.getValuesOfSingleFieldByDates(this.asset, this.field, startTime, currentTime, '20', 'seconds', 5);
            }
          })
        );

    this.latestPoints$.pipe(takeUntil(this.destroy$))
      .subscribe(
      points => {
        this.updateChart(points);
      }
    );
  }

  public loadHistoricData(maxPointsOptions: string, useDate: boolean, secondsInPast?: number) {
    if (useDate) {
      const startDate = this.startDate.valueOf();
      const endDate = moment(this.endDate).add(1, 'days').valueOf();
      this.latestPoints$ =  this.oispService.getValuesOfSingleFieldByDates(this.asset, this.field, startDate, endDate, maxPointsOptions);
    } else {
      this.latestPoints$ =  this.oispService.getValuesOfSingleField(this.asset, this.field, secondsInPast, maxPointsOptions);
    }
    this.latestPoints$.pipe(takeUntil(this.destroy$))
      .subscribe(
      points => {
        this.updateChart(points);
      }
    );
  }

  public updateChart(points: PointWithId[]) {
    points.forEach(point => {
      this.currentTimestamps.push(point.ts);
      this.currentNumberOfPoints += 1;
      const data = this.lineChartData[0].data as ChartPoint[];
      const currentDate: moment.Moment = moment(point.ts);
      data.push({ y: point.value, t: currentDate });
      this.lineChartLabels.push(currentDate.toISOString());
    });
    this.chart.update();
  }

  // events
  public chartClicked(event: { event?: MouseEvent; active?: { }[] }): void {
    console.log(event);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: { }[] }): void {
    console.log(event, active);
  }

  public changeColor() {
    this.lineChartColors[2].borderColor = 'green';
    this.lineChartColors[2].backgroundColor = `rgba(0, 255, 0, 0.3)`;
  }

  public changeLabel() {
    this.lineChartLabels[2] = ['1st Line', '2nd Line'];
    this.chart.update();
  }
}
