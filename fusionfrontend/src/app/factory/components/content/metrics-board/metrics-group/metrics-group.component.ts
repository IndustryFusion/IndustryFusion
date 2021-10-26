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

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FieldWidgetType } from '../../../../../store/field/field.model';
import { AssetMaintenanceUtils } from '../../../../util/asset-maintenance-utils';
import { FieldDetails, MetricDetail } from '../../../../../store/field-details/field-details.model';
import { FactoryAssetDetailsWithFields } from '../../../../../store/factory-asset-details/factory-asset-details.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-metrics-group',
  templateUrl: './metrics-group.component.html',
  styleUrls: ['./metrics-group.component.scss']
})
export class MetricsGroupComponent implements OnInit, OnChanges {

  @Input()
  asset: FactoryAssetDetailsWithFields;

  @Input()
  metricDetails: MetricDetail[];

  @Input()
  metricGroupName: string;

  @Input()
  index: number;

  @Input()
  groupsCount: number;

  showTitle: boolean;
  isHeightDifferent: boolean;
  isInitialized = false;

  WidgetType = FieldWidgetType;
  maintenanceUtils = AssetMaintenanceUtils;

  constructor(private readonly router: Router,
              private readonly activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.showTitle = this.metricGroupName != null || this.groupsCount > 1;
    this.updateMasonryLayout();
    this.isInitialized = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.metricDetails) {
      this.updateMasonryLayout();
    }
  }

  private updateMasonryLayout(): void {
    const metricHeight = 6.4;
    const metricMarginY = 1.25;
    const numSmallItemPlacesUsed = this.metricDetails.length + this.getLargeMetricsCount();
    const numRows = Math.ceil(numSmallItemPlacesUsed / 4);
    const metricsHeight = (metricHeight + metricMarginY) *
      (numRows + (this.getLargeMetricsCount() > 0 && numRows === 1 ? 1 : 0));

    document.documentElement.style.setProperty('--metric-small-height', `${ metricHeight }rem`);
    document.documentElement.style.setProperty('--metric-large-height', `${ metricHeight * 2 + metricMarginY * 0.5 }rem`);
    document.documentElement.style.setProperty('--metric-margin-y', `${ metricMarginY }rem`);
    document.documentElement.style.setProperty('--metrics-masonry-height-' + this.index, `${ metricsHeight }rem`);

    this.orderMetricsForMasonryLayout(numRows);
  }

  private getLargeMetricsCount(): number {
    return this.metricDetails.map(metric => this.isLargeMetric(metric) ? 1 : 0 as number)
      .reduce((accumulator, current) => accumulator + current);
  }

  private isLargeMetric(metricDetail: MetricDetail): boolean {
    return metricDetail.fieldDetails.widgetType === FieldWidgetType.GAUGE && this.hasAnyThreshold(metricDetail.fieldDetails);
  }

  private isSmallMetric(metricDetail: MetricDetail): boolean {
    return !this.isLargeMetric(metricDetail);
  }

  private orderMetricsForMasonryLayout(numRows: number): void {
    if (numRows > 1) {
      // reverse(): to preserve original order when using pop()
      const metricsForMasonryLayout: MetricDetail[] = [];
      const remainingSmallMetrics = [...this.metricDetails.filter(metric => this.isSmallMetric(metric)).reverse()];
      const remainingLargeMetrics = [...this.metricDetails.filter(metric => this.isLargeMetric(metric)).reverse()];

      this.isHeightDifferent = remainingSmallMetrics.length > 0 && remainingLargeMetrics.length > 0;

      // masonry layout adds the items columns-wise, so we have to ensure that every column (except last) uses all row spaces
      let row = 0;
      while (remainingLargeMetrics.length > 0 || remainingSmallMetrics.length > 0) {
        if (row >= numRows) {
          row = 0;
        }

        const isRowOverflowForLarge = row + 2 >= numRows;
        if (remainingLargeMetrics.length > 0 && !isRowOverflowForLarge) {
          metricsForMasonryLayout.push(remainingLargeMetrics.pop());
          row += 2;
        } else if (remainingSmallMetrics.length > 0) {
          metricsForMasonryLayout.push(remainingSmallMetrics.pop());
          row++;
        } else {
          metricsForMasonryLayout.push(remainingLargeMetrics.pop());
          row += 2;
        }
      }

      this.metricDetails = metricsForMasonryLayout;
    }
  }

  hasAnyThreshold(fieldDetail: FieldDetails): boolean {
    return fieldDetail.absoluteThreshold != null || fieldDetail.criticalThreshold != null || fieldDetail.idealThreshold != null;
  }

  navigateToMetric(metric: MetricDetail) {
    const navigationOptions = { fragment: 'metric-' + metric.externalName, relativeTo: this.activatedRoute };
    return this.router.navigate(['..', 'historical'], navigationOptions);
  }
}
