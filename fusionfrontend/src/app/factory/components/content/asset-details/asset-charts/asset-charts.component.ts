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

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ChartDataSets, ChartOptions, ChartPoint, ChartScales, LinearScale } from 'chart.js';
import { BaseChartDirective, Color, Label } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { Observable, Subject, timer } from 'rxjs';
import { FieldDetails } from 'src/app/core/store/field-details/field-details.model';
import { Asset } from 'src/app/core/store/asset/asset.model';
import { OispService } from 'src/app/core/services/api/oisp.service';
import * as moment from 'moment';
import { PointWithId } from '../../../../../core/services/api/oisp.model';
import { switchMap, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { StatusPoint } from '../../../../models/status.model';
import { AssetChartHelper } from '../../../../../core/helpers/asset-chart-helper';

@Component({
  selector: 'app-asset-charts',
  templateUrl: './asset-charts.component.html',
  styleUrls: ['./asset-charts.component.scss']
})
export class AssetChartsComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  fieldDetails: FieldDetails;

  @Input()
  asset: Asset;

  @Input()
  options: string;

  @Input()
  maxPoints: number;

  @Input()
  clickedOk: boolean;

  @Input()
  startDate: moment.Moment;

  @Input()
  endDate: moment.Moment;

  @Output()
  loadedEvent = new EventEmitter<void>();

  readonly STATUS_MAX_POINTS = 100000;

  name: string;
  initialized = false;
  currentNumberOfPoints = 0;

  destroy$: Subject<boolean> = new Subject<boolean>();
  latestPoints$: Observable<PointWithId[]>;

  statuses: StatusPoint[];
  isStatus: boolean;

  public thresholdColors = [
    { backgroundColor: '#fceace', borderColor: '#f5b352' },
    { backgroundColor: '#e6cfce', borderColor: '#a14b47' },
  ];

  public lineChartData: ChartDataSets[] = [{ data: [], label: '', fill: false, borderWidth: 2 }];
  public lineChartLabels: Label[] = [];
  public lineChartOptions: (ChartOptions & { annotation: any });
  public lineChartColors: Color[] = [{ backgroundColor: 'rgba(148,159,177,0.2)', borderColor: '#53a7ca' }];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [pluginAnnotations];

  @ViewChild(BaseChartDirective, { static: false }) chart: BaseChartDirective;

  constructor(private oispService: OispService) {
  }

  ngOnInit() {
    this.isStatus = this.fieldDetails.externalName === 'status';
    if (this.isStatus) {
      this.maxPoints = this.STATUS_MAX_POINTS;
    }

    this.lineChartData[0].label = this.fieldDetails.description;
    this.initLineChartOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialized) {
      if (changes.options || changes.maxPoints) {
        switch (this.options) {
          case 'current':
            this.flushData();
            this.loadNewData();
            break;
          case '1hour':
            this.flushData();
            this.loadHistoricData(this.maxPoints, false, 3600);
            break;
          case '1day':
            this.flushData();
            this.loadHistoricData(this.maxPoints, false, 86400);
            break;
          case 'customDate':
            this.flushData();
            if (changes.maxPoints && this.clickedOk) {
              this.loadHistoricData(this.maxPoints, true);
            }
            break;
          default:
            break;
        }
      }
      if (changes.startDate || changes.endDate) {
        this.flushData();
      }
      if (changes.clickedOk) {
        if (this.clickedOk) {
          switch (this.options) {
            case 'customDate':
              this.loadHistoricData(this.maxPoints, true);
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

  public loadHistoricData(maxPoints: number, useDate: boolean, secondsInPast?: number): void {
    if (useDate) {
      const startDate = this.startDate.valueOf();
      const endDate = moment(this.endDate).add(1, 'days').valueOf();
      this.latestPoints$ = this.oispService.getValuesOfSingleFieldByDates(this.asset, this.fieldDetails, startDate, endDate, maxPoints);
    } else {
      this.latestPoints$ = this.oispService.getValuesOfSingleField(this.asset, this.fieldDetails, secondsInPast, maxPoints);
    }
    this.latestPoints$.pipe(takeUntil(this.destroy$))
      .subscribe(
        points => {
          this.updateChart(points);
          this.initLineChartOptions();
        }
      );
  }

  public updateChart(points: PointWithId[]): void {
    points.forEach(point => {
      this.currentNumberOfPoints += 1;
      const data = this.lineChartData[0].data as ChartPoint[];
      const dateOfPoint: moment.Moment = moment(point.ts);
      data.push({ y: point.value, t: dateOfPoint });
      this.lineChartLabels.push(dateOfPoint.toISOString());
    });

    if (this.isStatus) {
      this.updateStatusPoints();
    } else {
      this.updateThresholds(points);
      this.chart.update();
    }

    this.loadedEvent.emit();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  private initLineChartOptions(): void {
    const minMaxYAxis = AssetChartHelper.getYMinMaxByAbsoluteThreshold(this.fieldDetails);
    const minDate = AssetChartHelper.getMinDate(this.lineChartData[0].data as ChartPoint[]);

    const scales: ChartScales | LinearScale = {
      xAxes: [{
        type: 'time',
        distribution: 'linear',
        time: {
          parser: 'MM/DD/YYYY HH:mm',
          tooltipFormat: 'll HH:mm',
          unit: 'hour',
          unitStepSize: 4,
          displayFormats: {
            hour: 'MM/DD/YYYY HH:mm'
          },
        },
        ticks: {
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
          maxTicksLimit: 10,
          min: minDate,
        },
      }],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
          ticks: minMaxYAxis,
          scaleLabel: {
            display: true,
            labelString: this.fieldDetails.unit,
            fontSize: 14,
            fontStyle: 'bold'
          }
        },
      ]
    };

    const annotation = this.getAnnotationsByIdealAndCriticalThresholds(minMaxYAxis);

    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales,
      elements: {
        line: {
          borderWidth: 1
        },
        point: {
          radius: 2
        }
      },
      annotation
    };
  }

  private getAnnotationsByIdealAndCriticalThresholds(minMax: { min?: number, max?: number }): any {
    const annotations = [];

    if (this.fieldDetails.idealThreshold) {
      const minLower = this.fieldDetails.criticalThreshold?.valueLower ?? minMax.min;
      const maxUpper = this.fieldDetails.criticalThreshold?.valueUpper ?? minMax.max;
      annotations.push(this.getAnnotation(ThresholdColorIndex.IDEAL, minLower, this.fieldDetails.idealThreshold.valueLower));
      annotations.push(this.getAnnotation(ThresholdColorIndex.IDEAL, this.fieldDetails.idealThreshold.valueUpper, maxUpper));
    }
    if (this.fieldDetails.criticalThreshold) {
      annotations.push(this.getAnnotation(ThresholdColorIndex.CRITICAL, minMax.min, this.fieldDetails.criticalThreshold.valueLower));
      annotations.push(this.getAnnotation(ThresholdColorIndex.CRITICAL, this.fieldDetails.criticalThreshold.valueUpper, minMax.max));
    }

    return { annotations };
  }

  private getAnnotation(colorIndex: ThresholdColorIndex, yMin?: number, yMax?: number): any {
    return {
      drawTime: 'beforeDatasetsDraw',
      type: 'box',
      yScaleID: 'y-axis-0',
      yMin,
      yMax,
      backgroundColor: this.thresholdColors[colorIndex].backgroundColor,
      borderColor: this.thresholdColors[colorIndex].borderColor,
      borderWidth: 2
    };
  }

  private getYMinMaxOfPoints(points?: PointWithId[]): { min?: number, max?: number } {
    let minMax: { min?: number, max?: number } = AssetChartHelper.getYMinMaxByAbsoluteThreshold(this.fieldDetails);

    const isNoStrictMinMax = (minMax.min == null || minMax.max == null); // ! would also include zero
    if (points && isNoStrictMinMax) {
      const minValueOfData = Math.min.apply(Math, points.map(point => point.value));
      const maxValueOfData = Math.max.apply(Math, points.map(point => point.value));
      const space = Math.max(1, (maxValueOfData - minValueOfData) / 4);
      minMax = { min: minValueOfData - space, max: maxValueOfData + space };
    }

    return minMax;
  }

  private flushData(): void {
    this.lineChartData[0].data = [];
    this.lineChartLabels = [];
    this.currentNumberOfPoints = 0;
    this.destroy$.next(true);
  }

  private loadNewData(): void {
    let gotFirstPoints = false;
    let currentTime = moment().valueOf();
    let startTime = currentTime - 600000;
    this.latestPoints$ = timer(0, environment.dataUpdateIntervalMs)
      .pipe(
        switchMap(() => {
          // If we already received some points, only take points from last 5 seconds.
          if (gotFirstPoints) {
            currentTime = moment().valueOf();
            startTime = currentTime - environment.dataUpdateIntervalMs;
            return this.oispService.getValuesOfSingleFieldByDates(this.asset, this.fieldDetails, startTime, currentTime, 1);
          } else {
            gotFirstPoints = true;
            return this.oispService.getValuesOfSingleFieldByDates(this.asset, this.fieldDetails, startTime, currentTime, 20,
              'seconds', 5);
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

  private updateThresholds(newPoints: PointWithId[]): void {
    const minMax = this.getUpdatedYMinMax(newPoints);
    this.chart.chart.options.scales.yAxes[0].ticks.min = minMax.min;
    this.chart.chart.options.scales.yAxes[0].ticks.max = minMax.max;
    this.lineChartOptions.scales.yAxes[0].ticks.min = minMax.min;
    this.lineChartOptions.scales.yAxes[0].ticks.max = minMax.max;

    this.lineChartOptions.annotation = this.getAnnotationsByIdealAndCriticalThresholds(minMax);
  }

  private updateStatusPoints(): void {
    this.statuses = [];
    this.lineChartData[0].data.forEach(chartPoint => {
      if (typeof chartPoint.y === 'number') {
        this.statuses.push({ status: Math.round(chartPoint.y), time: chartPoint.t });
      }
    });
  }

  private getUpdatedYMinMax(newPoints?: PointWithId[]): { min: number, max: number } {
    const minMaxOfNewPoints = this.getYMinMaxOfPoints(newPoints);
    const minMaxOfChart = {
      min: this.chart.chart.options.scales.yAxes[0].ticks.min ?? 99999999,
      max: this.chart.chart.options.scales.yAxes[0].ticks.max ?? -9999999
    };
    return {
      min: Math.min(minMaxOfNewPoints.min, minMaxOfChart.min),
      max: Math.max(minMaxOfNewPoints.max, minMaxOfChart.max)
    };
  }
}

enum ThresholdColorIndex {
  IDEAL = 0,
  CRITICAL = 1
}
