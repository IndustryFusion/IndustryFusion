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

  public gaugeLabels = [
    { color: '#A73737', label: 'critical' },
    { color: '#FCA82B', label: 'warning' },
    { color: '#2CA9CE', label: 'ideal' },
    { color: '#000000', label: 'current value' },
  ];

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
    const isRedSection = this.fieldDetail.criticalThreshold != null && this.fieldDetail.absoluteThreshold != null;
    const isYellowSection = this.fieldDetail.idealThreshold != null && this.fieldDetail.criticalThreshold != null;
    const isIdealSection = this.fieldDetail.idealThreshold != null;

    const minMax = this.getMinMaxValuesOfChart(isRedSection, isYellowSection, isIdealSection);
    const indicatorWidth = Math.max(2, Math.round((minMax.max - minMax.min) / 80));

    if (isRedSection) {
      this.addDataToDataset(GAUGE_INDEX.ABSOLUTE_CRITICAL,
        this.fieldDetail.absoluteThreshold.valueLower, this.fieldDetail.criticalThreshold.valueLower);
    }
    if (isYellowSection) {
      this.addDataToDataset(GAUGE_INDEX.CRITICAL_IDEAL,
        this.fieldDetail.criticalThreshold.valueLower, this.fieldDetail.idealThreshold.valueLower);
    }

    if (isIdealSection) {
      const tooltipLabelIdealRange = `${this.fieldDetail.idealThreshold.valueLower} - ${ this.fieldDetail.idealThreshold.valueUpper} (${this.gaugeLabels[GAUGE_INDEX.IDEAL].label})`;

      this.addDataToDataset(GAUGE_INDEX.IDEAL, this.fieldDetail.idealThreshold.valueLower, this.metricValue, tooltipLabelIdealRange);
      this.addDataToDataset(GAUGE_INDEX.VALUE_INDICATOR,
        this.metricValue - indicatorWidth / 2, this.metricValue + indicatorWidth / 2);
      this.addDataToDataset(GAUGE_INDEX.IDEAL, this.metricValue, this.fieldDetail.idealThreshold.valueUpper, tooltipLabelIdealRange);
    }

    if (isYellowSection) {
      this.addDataToDataset(GAUGE_INDEX.CRITICAL_IDEAL,
        this.fieldDetail.idealThreshold.valueUpper, this.fieldDetail.criticalThreshold.valueUpper);
    }
    if (isRedSection) {
      this.addDataToDataset(GAUGE_INDEX.ABSOLUTE_CRITICAL,
        this.fieldDetail.criticalThreshold.valueUpper, this.fieldDetail.absoluteThreshold.valueUpper);
    }
  }

  private getMinMaxValuesOfChart(isRedSection: boolean, isYellowSection: boolean, isIdealSection: boolean):
    { min?: number, max?: number }  {
    if (isRedSection) {
      return {
        min: this.fieldDetail.absoluteThreshold.valueLower,
        max: this.fieldDetail.absoluteThreshold.valueUpper
      };
    } else if (isYellowSection) {
      return {
        min: this.fieldDetail.criticalThreshold.valueLower,
        max: this.fieldDetail.criticalThreshold.valueUpper
      };
    } else if (isIdealSection) {
      return {
        min: this.fieldDetail.idealThreshold.valueLower,
        max: this.fieldDetail.idealThreshold.valueUpper
      };
    } else {
      return { min: this.metricValue - 5, max: this.metricValue + 5 };  // random value
    }
  }

  private addDataToDataset(index: GAUGE_INDEX, startThreshold: number, endThreshold: number, tooltipLabel?: string): void {
    if (tooltipLabel == null) {
      tooltipLabel = `${startThreshold} - ${endThreshold} (${this.gaugeLabels[index].label})`;
      if (index === GAUGE_INDEX.VALUE_INDICATOR) {
        tooltipLabel = `${this.metricValue} (${this.gaugeLabels[index].label})`;
      }
    }

    this.data.labels.push(tooltipLabel);
    this.data.datasets[0].data.push(endThreshold - startThreshold);
    (this.data.datasets[0].backgroundColor as string[]).push(this.gaugeLabels[index].color);
  }
}

enum GAUGE_INDEX {
  ABSOLUTE_CRITICAL,
  CRITICAL_IDEAL,
  IDEAL,
  VALUE_INDICATOR,
}
