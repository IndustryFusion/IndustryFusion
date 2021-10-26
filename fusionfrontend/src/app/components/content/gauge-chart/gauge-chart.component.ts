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
import { FieldDetails } from '../../../store/field-details/field-details.model';
import { Asset } from '../../../store/asset/asset.model';
import { ChartData } from 'chart.js';
import { Threshold } from '../../../store/threshold/threshold.model';
import { GermanNumberPipe } from '../../../pipes/germannumber.pipe';

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.scss']
})
export class GaugeChartComponent implements OnInit {

  @Input()
  fieldDetail: FieldDetails;

  @Input()
  metricValue: number;

  @Input()
  asset: Asset;

  @Input()
  title: string;

  @ViewChild('chart') chart: UIChart;

  data: ChartData;
  chartOptions: any;

  private indicatorWidth: number;
  private gaugeLabels = [
    { color: '#A73737', label: 'critical' },
    { color: '#FCA82B', label: 'warning' },
    { color: '#2CA9CE', label: 'ideal' },
    { color: '#000000', label: 'current value' },
  ];

  private germanNumberPipe: GermanNumberPipe = new GermanNumberPipe();

  constructor() {
    this.initChartOptions();
    this.initChartData();
  }

  private initChartOptions() {
    const tooltips = {
      mode: 'index',
      position: 'nearest',
      callbacks: {
        title(tooltipItem, data) {
          return data.labels[tooltipItem[0].index];
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
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        borderWidth: 0,
      }]
    };
  }

  ngOnInit() {
    this.updateChart();
  }

  private updateChart() {
    this.updateChartData();
    this.chart?.reinit();
  }

  private updateChartData() {
    const emptyBackgroundColors: string[] = [];
    this.data.labels = [];
    this.data.datasets = [{ backgroundColor: emptyBackgroundColors, data: [], borderWidth: 0 }];
    this.addRangesForIdealAndCriticalThresholds();
  }

  private addRangesForIdealAndCriticalThresholds(): void {
    const isAbsoluteThreshold = this.fieldDetail.absoluteThreshold != null;
    const isCriticalThreshold = this.fieldDetail.criticalThreshold != null;
    const isIdealThreshold = this.fieldDetail.idealThreshold != null;
    const hasAtLeastTwoThresholds = (isAbsoluteThreshold ? 1 : 0) + (isCriticalThreshold ? 1 : 0) + (isIdealThreshold ? 1 : 0) >= 2;

    const minMax = this.getMinMaxValuesOfChart(isAbsoluteThreshold, isCriticalThreshold, isIdealThreshold);
    this.indicatorWidth = Math.max(2, Math.round(((Math.max(this.metricValue, minMax.max) - Math.min(this.metricValue, minMax.min)) / 80)));

    if (hasAtLeastTwoThresholds) {
      this.addValueIndicatorAtStartIfBelowRanges(minMax, isAbsoluteThreshold && isIdealThreshold && !isCriticalThreshold);
      this.addRangesForTwoOrThreeThresholds(isAbsoluteThreshold, isCriticalThreshold, isIdealThreshold);
      this.addValueIndicatorAtStartIfAboveRanges(minMax, isAbsoluteThreshold && isIdealThreshold && !isCriticalThreshold);
    } else {
      this.addRangesForOneThreshold(isAbsoluteThreshold, isCriticalThreshold, isIdealThreshold);
    }
  }

  private addValueIndicatorAtStartIfBelowRanges(minMax: { min: number, max: number },
                                                addCritical: boolean): void {
    if (this.metricValue < minMax.min) {
      this.addValueIndicatorToDataset();
      if (addCritical) {
        this.addDataToDataset(RANGE_INDEX.CRITICAL, this.metricValue, this.fieldDetail.absoluteThreshold.valueLower);
      }
    }
  }

  private addValueIndicatorAtStartIfAboveRanges(minMax: { min: number, max: number },
                                                addCritical: boolean): void {
    if (this.metricValue > minMax.max) {
      if (addCritical) {
        this.addDataToDataset(RANGE_INDEX.CRITICAL, this.fieldDetail.absoluteThreshold.valueUpper, this.metricValue);
      }
      this.addValueIndicatorToDataset();
    }
  }

  private addValueIndicatorToDataset() {
    this.addDataToDataset(RANGE_INDEX.VALUE_INDICATOR,
      this.metricValue - this.indicatorWidth / 2, this.metricValue + this.indicatorWidth / 2);
  }

  private addRangesForTwoOrThreeThresholds(isAbsoluteThreshold: boolean,
                                           isCriticalThreshold: boolean,
                                           isIdealThreshold: boolean) {
    // Possible combinations of thresholds with gauge color ranges:
    // 1) absolute & critical & ideal -> red, yellow, blue
    // 2) absolute & ideal    -> yellow, blue (in threshold bounds)  |  red, blue (outside)
    // 3) absolute & critical -> red, blue
    // [4) critical & ideal     -> yellow, blue]

    if (isAbsoluteThreshold) {
      this.addLowerRangeToDataset(isCriticalThreshold ? RANGE_INDEX.CRITICAL : RANGE_INDEX.WARNING,
        this.fieldDetail.absoluteThreshold,
        isCriticalThreshold ? this.fieldDetail.criticalThreshold : this.fieldDetail.idealThreshold);
    }
    if (isCriticalThreshold && isIdealThreshold) {
      this.addLowerRangeToDataset(RANGE_INDEX.WARNING, this.fieldDetail.criticalThreshold, this.fieldDetail.idealThreshold);
    }

    if (isIdealThreshold) {
      this.addLowerWithUpperRangeToDataset(RANGE_INDEX.IDEAL, this.fieldDetail.idealThreshold);
    } else if (isAbsoluteThreshold && isCriticalThreshold) {
      this.addLowerWithUpperRangeToDataset(RANGE_INDEX.IDEAL, this.fieldDetail.criticalThreshold);
    }

    if (isCriticalThreshold && isIdealThreshold) {
      this.addUpperRangeToDataset(RANGE_INDEX.WARNING, this.fieldDetail.idealThreshold, this.fieldDetail.criticalThreshold);
    }
    if (isAbsoluteThreshold) {
      const startingThreshold = isCriticalThreshold ? this.fieldDetail.criticalThreshold : this.fieldDetail.idealThreshold;
      this.addUpperRangeToDataset(isCriticalThreshold ? RANGE_INDEX.CRITICAL : RANGE_INDEX.WARNING,
        startingThreshold, this.fieldDetail.absoluteThreshold);
    }
  }

  private addRangesForOneThreshold(isAbsoluteThreshold: boolean,
                                   isCriticalThreshold: boolean,
                                   isIdealThreshold: boolean) {
    // 5) absolute -> blue (in threshold bounds) | red,    blue (outside)
    // [6) critical -> blue (in threshold bounds) | red,    blue (outside)]
    // [7) ideal    -> blue (in threshold bounds) | yellow, blue (outside)]
    // 8) none -> not working
    if (isAbsoluteThreshold || isCriticalThreshold || isIdealThreshold) {
      if (isAbsoluteThreshold) {
        this.addDatasetsForSingleThreshold(RANGE_INDEX.CRITICAL, this.fieldDetail.absoluteThreshold);
      } else if (isCriticalThreshold) {
        this.addDatasetsForSingleThreshold(RANGE_INDEX.CRITICAL, this.fieldDetail.criticalThreshold);
      } else {
        this.addDatasetsForSingleThreshold(RANGE_INDEX.WARNING, this.fieldDetail.idealThreshold);
      }
    }
  }

  private addDatasetsForSingleThreshold(rangeIndexOutsideThreshold: RANGE_INDEX,
                                        threshold: Threshold,
                                        rangeIndexWithinThreshold: RANGE_INDEX = RANGE_INDEX.IDEAL) {
    if (this.metricValue < threshold.valueLower) {
      this.addValueIndicatorToDataset();
      this.addDataToDataset(rangeIndexOutsideThreshold, this.metricValue, threshold.valueLower);
      this.addDataToDataset(rangeIndexWithinThreshold, threshold.valueLower, threshold.valueUpper);

    } else if (this.metricValue > threshold.valueUpper) {
      this.addDataToDataset(rangeIndexWithinThreshold, threshold.valueLower, threshold.valueUpper);
      this.addDataToDataset(rangeIndexOutsideThreshold, threshold.valueLower, this.metricValue);
      this.addValueIndicatorToDataset();

    } else {
      this.addRangeWithValueIndicator(rangeIndexWithinThreshold, threshold.valueLower, threshold.valueUpper);
    }
  }

  private addLowerRangeToDataset(rangeIndex: RANGE_INDEX,
                                 startThreshold: Threshold,
                                 endThreshold: Threshold): void {
    if (startThreshold.valueLower <= this.metricValue && this.metricValue <= endThreshold.valueLower) {
      this.addRangeWithValueIndicator(rangeIndex, startThreshold.valueLower, endThreshold.valueLower);
    } else {
      this.addDataToDataset(rangeIndex, startThreshold.valueLower, endThreshold.valueLower);
    }
  }

  private addLowerWithUpperRangeToDataset(rangeIndex: RANGE_INDEX,
                                          threshold: Threshold): void {
    if (threshold.valueLower <= this.metricValue && this.metricValue <= threshold.valueUpper) {
      this.addRangeWithValueIndicator(rangeIndex, threshold.valueLower, threshold.valueUpper);
    } else {
      this.addDataToDataset(rangeIndex, threshold.valueLower, threshold.valueUpper);
    }
  }

  private addUpperRangeToDataset(rangeIndex: RANGE_INDEX,
                                 startThreshold: Threshold,
                                 endThreshold: Threshold): void {
    if (startThreshold.valueUpper <= this.metricValue && this.metricValue <= endThreshold.valueUpper) {
      this.addRangeWithValueIndicator(rangeIndex, startThreshold.valueUpper, endThreshold.valueUpper);
    } else {
      this.addDataToDataset(rangeIndex, startThreshold.valueUpper, endThreshold.valueUpper);
    }
  }

  private addRangeWithValueIndicator(rangeIndex: RANGE_INDEX,
                                     valueLower: number,
                                     valueUpper: number): void {
    const tooltipLabelIdealRange = `${this.germanNumberPipe.transform(valueLower)} - ${this.germanNumberPipe.transform(valueUpper)} (${this.gaugeLabels[rangeIndex].label})`;

    this.addDataToDataset(rangeIndex, valueLower, this.metricValue, tooltipLabelIdealRange);
    this.addValueIndicatorToDataset();
    this.addDataToDataset(rangeIndex, this.metricValue, valueUpper, tooltipLabelIdealRange);
  }

  private getMinMaxValuesOfChart(isAbsoluteThreshold: boolean, isCriticalThreshold: boolean, isIdealThreshold: boolean):
    { min: number, max: number }  {
    if (isAbsoluteThreshold) {
      return {
        min: this.fieldDetail.absoluteThreshold.valueLower,
        max: this.fieldDetail.absoluteThreshold.valueUpper
      };
    } else if (isCriticalThreshold) {
      return {
        min: this.fieldDetail.criticalThreshold.valueLower,
        max: this.fieldDetail.criticalThreshold.valueUpper
      };
    } else if (isIdealThreshold) {
      return {
        min: this.fieldDetail.idealThreshold.valueLower,
        max: this.fieldDetail.idealThreshold.valueUpper
      };
    } else {
      return { min: this.metricValue - 5, max: this.metricValue + 5 };  // random value
    }
  }

  private addDataToDataset(rangeIndex: RANGE_INDEX, startThreshold: number, endThreshold: number, tooltipLabel?: string): void {
    if (tooltipLabel == null) {
      tooltipLabel = `${this.germanNumberPipe.transform(startThreshold)} - ${this.germanNumberPipe.transform(endThreshold)} (${this.gaugeLabels[rangeIndex].label})`;
      if (rangeIndex === RANGE_INDEX.VALUE_INDICATOR) {
        tooltipLabel = `${this.germanNumberPipe.transform(this.metricValue)} (${this.gaugeLabels[rangeIndex].label})`;
      }
    }

    this.data.labels.push(tooltipLabel);
    this.data.datasets[0].data.push(endThreshold - startThreshold);
    (this.data.datasets[0].backgroundColor as string[]).push(this.gaugeLabels[rangeIndex].color);
  }
}

enum RANGE_INDEX {
  CRITICAL,
  WARNING,
  IDEAL,
  VALUE_INDICATOR,
}
