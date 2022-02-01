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
import { TimeInterval } from '../../../../../core/models/kairos.model';
import { AssetChartInterval } from '../../../../models/asset-chart-interval.model';

@Component({
  selector: 'app-asset-chart',
  templateUrl: './asset-chart.component.html',
  styleUrls: ['./asset-chart.component.scss']
})
export class AssetChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  fieldDetails: FieldDetails;

  @Input()
  asset: Asset;

  @Input()
  interval: AssetChartInterval;

  @Input()
  maxPoints: number;

  @Input()
  clickedOk: boolean;

  @Input()
  startDate: Date = null;

  @Input()
  endDate: Date = null;

  @Input()
  description: string = null;

  @Input()
  showPointCount = true;

  @Input()
  noMargin = false;

  @Output()
  loadedEvent = new EventEmitter<void>();

  name: string;
  initialized = false;
  currentNumberOfPoints = 0;

  destroy$: Subject<boolean> = new Subject<boolean>();
  latestPoints$: Observable<PointWithId[]>;

  statuses: StatusPoint[];
  isStatus: boolean;
  selectedTimeInterval: TimeInterval;

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

  private readonly STATUS_MAX_POINTS = 100000;
  private readonly MAX_POINTS_CURRENT = 150;

  @ViewChild(BaseChartDirective, { static: false }) chart: BaseChartDirective;

  constructor(private oispService: OispService) {
  }

  ngOnInit() {
    this.isStatus = this.fieldDetails.externalName === 'status';
    if (this.isStatus) {
      this.maxPoints = this.STATUS_MAX_POINTS;
    }

    if (!this.description) {
      this.description = this.fieldDetails.description;
    }

    this.lineChartData[0].label = this.description;
    this.updateLineChartOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.interval || changes.maxPoints) {
      switch (this.interval) {
        case AssetChartInterval.CURRENT:
          this.flushData();
          this.loadCurrentData();
          break;
        case AssetChartInterval.ONE_HOUR:
          this.flushData();
          this.loadHistoricDataBackwards(this.maxPoints, 3600);
          break;
        case AssetChartInterval.ONE_DAY:
          this.flushData();
          this.loadHistoricDataBackwards(this.maxPoints, 86400);
          break;
        case AssetChartInterval.CUSTOM_DATE:
          this.flushData();
          if (changes.maxPoints && this.clickedOk) {
            this.loadHistoricDataByDates(this.maxPoints);
          }
          break;
        default:
          break;
      }
    }

    if (this.initialized) {
      if (changes.startDate || changes.endDate) {
        this.flushData();
      }

      if (changes.clickedOk) {
        if (this.clickedOk) {
          switch (this.interval) {
            case AssetChartInterval.CUSTOM_DATE:
              this.loadHistoricDataByDates(this.maxPoints);
              break;
            default:
              break;
          }
        }
      }
    } else {
      this.initialized = true;
    }
  }

  private flushData(): void {
    this.statuses = [];
    this.lineChartData[0].data = [];
    this.lineChartLabels = [];
    this.currentNumberOfPoints = 0;
    this.destroy$.next(true);
  }

  private loadCurrentData(): void {
    let gotFirstPoints = false;

    this.latestPoints$ = timer(0, environment.dataUpdateIntervalMs)
      .pipe(
        switchMap(() => {
          // If we already received some points, only take points from last n (e.g. 5) seconds.
          const timestampNowMs = moment().valueOf();
          if (gotFirstPoints) {
            const timestampStartMs = timestampNowMs - environment.dataUpdateIntervalMs;
            this.selectedTimeInterval.endMs = timestampNowMs;

            return this.oispService.getValuesOfSingleFieldByInterval(this.asset, this.fieldDetails,
              new TimeInterval(timestampStartMs, timestampNowMs), 1);
          } else {
            const timestampStartMs = timestampNowMs - 600000;
            this.selectedTimeInterval = new TimeInterval(timestampStartMs, timestampNowMs);

            gotFirstPoints = true;
            return this.oispService.getValuesOfSingleFieldByInterval(this.asset, this.fieldDetails, this.selectedTimeInterval, 20,
              'seconds', 5);
          }
        })
      );

    this.subscribeToLatestPoints();
  }

  private loadHistoricDataByDates(maxPoints: number): void {
    const timestampStartMs = moment(new Date(this.startDate.toDateString())).valueOf();
    const timestampEndMs = moment(this.endDate).add(1, 'days').valueOf();
    this.selectedTimeInterval = new TimeInterval(timestampStartMs, timestampEndMs);

    this.latestPoints$ = this.oispService.getValuesOfSingleFieldByInterval(this.asset, this.fieldDetails,
      this.selectedTimeInterval, maxPoints);
    this.subscribeToLatestPoints();
  }

  private loadHistoricDataBackwards(maxPoints: number, secondsInPast: number): void {
    const timestampNowMs = moment().valueOf();
    const timestampStartMs = timestampNowMs - secondsInPast * 1000;
    this.selectedTimeInterval = new TimeInterval(timestampStartMs, timestampNowMs);

    this.latestPoints$ = this.oispService.getValuesOfSingleField(this.asset, this.fieldDetails, secondsInPast, maxPoints);
    this.subscribeToLatestPoints();
  }

  private subscribeToLatestPoints(): void {
    this.latestPoints$.pipe(takeUntil(this.destroy$))
      .subscribe(
        points => {
          this.updateChart(points);
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

      this.limitPointCountOfCurrentData(points.length, data);
    });

    if (this.isStatus) {
      this.updateStatusPoints();
    } else {
      this.updateThresholds(points);
      this.updateLineChartOptions();
      this.chart.update();
    }

    this.loadedEvent.emit();
  }

  private limitPointCountOfCurrentData(newPointsCount: number, data: ChartPoint[]): void {
    if (newPointsCount === 1 && data.length > this.MAX_POINTS_CURRENT) {
      data.shift();
      this.currentNumberOfPoints -= 1;
    }
  }

  private updateStatusPoints(): void {
    this.statuses = [];
    this.lineChartData[0].data.forEach(chartPoint => {
      if (typeof chartPoint.y === 'number') {
        this.statuses.push({ status: Math.round(chartPoint.y), time: chartPoint.t });
      }
    });
  }

  private updateThresholds(newPoints: PointWithId[]): void {
    const minMax = this.getUpdatedYMinMax(newPoints);
    this.chart.chart.options.scales.yAxes[0].ticks.min = minMax.min;
    this.chart.chart.options.scales.yAxes[0].ticks.max = minMax.max;
    this.lineChartOptions.scales.yAxes[0].ticks.min = minMax.min;
    this.lineChartOptions.scales.yAxes[0].ticks.max = minMax.max;

    this.lineChartOptions.annotation = this.getAnnotationsByIdealAndCriticalThresholds(minMax);
  }

  private updateLineChartOptions(): void {
    const xAxisOptions = AssetChartHelper.calculateXAxisOptions(this.lineChartData[0].data as ChartPoint[]);
    const minMaxYAxis = AssetChartHelper.getYMinMaxByAbsoluteThreshold(this.fieldDetails);

    const scales: ChartScales | LinearScale = {
      xAxes: [{
        type: 'time',
        distribution: 'linear',
        time: {
          parser: 'MM/DD/YYYY HH:mm',
          tooltipFormat: 'll HH:mm',
          unit: xAxisOptions.xAxisUnit,
          unitStepSize: xAxisOptions.xAxisStepSize,
          displayFormats: {
            second: 'HH:mm:ss',
            minute: 'HH:mm',
            hour: 'MM/DD/YYYY HH:mm',
            day: 'MM/DD/YYYY HH:mm'
          },
        },
        ticks: {
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
          maxTicksLimit: 10,
          min: xAxisOptions.startTimestampMs
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
      animation: {
        duration: 0
      },
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

enum ThresholdColorIndex {
  IDEAL = 0,
  CRITICAL = 1
}
