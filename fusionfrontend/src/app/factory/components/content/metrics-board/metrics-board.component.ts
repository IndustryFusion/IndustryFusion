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

import { Component, OnInit } from '@angular/core';
import { FactoryComposedQuery } from '../../../../store/composed/factory-composed.query';
import { FieldDetailsQuery } from '../../../../store/field-details/field-details.query';
import { FieldDetails } from '../../../../store/field-details/field-details.model';
import { OispDeviceQuery } from '../../../../store/oisp/oisp-device/oisp-device.query';
import { DeviceComponent } from '../../../../store/oisp/oisp-device/oisp-device.model';
import { OispService } from '../../../../services/oisp.service';
import { FactoryAssetDetailsWithFields } from '../../../../store/factory-asset-details/factory-asset-details.model';
import { PointWithId } from '../../../../services/oisp.model';
import { FieldWidgetType } from '../../../../store/field/field.model';
import { AssetMaintenanceUtils } from '../../../util/asset-maintenance-utils';
import { ArrayHelper } from '../../../../common/utils/array-helper';

@Component({
  selector: 'app-metrics-board',
  templateUrl: './metrics-board.component.html',
  styleUrls: ['./metrics-board.component.scss']
})
export class MetricsBoardComponent implements OnInit {

  isLoaded = false;
  WidgetType = FieldWidgetType;
  maintenanceUtils = AssetMaintenanceUtils;
  metricGroups: Map<string, MetricDetail[]>  = new Map();
  asset: FactoryAssetDetailsWithFields;

  private fieldDetails: FieldDetails[];
  private metricsDetailMap: Map<string, MetricDetail> = new Map();
  metricsDetails: MetricDetail[] = [];

  constructor(factoryComposedQuery: FactoryComposedQuery,
              fieldDetailsQuery: FieldDetailsQuery,
              private oispDeviceQuery: OispDeviceQuery,
              public oispService: OispService) {

    factoryComposedQuery.selectActiveAssetWithFieldInstanceDetails().subscribe(asset => {
      this.asset = asset;
      fieldDetailsQuery.selectMetricFieldsOfAsset(asset.id).subscribe(fieldDetails => {
          if (fieldDetails?.length > 0) {
            this.fieldDetails = fieldDetails;
            fieldDetails.forEach(fieldDetail => {
              const deviceComponent = this.oispDeviceQuery.getComponentOfFieldInstance(asset.externalName, fieldDetail.externalName);
              if (deviceComponent) {
                this.metricsDetailMap.set(deviceComponent.cid, {
                  externalName: fieldDetail.externalName,
                  deviceComponent,
                  fieldDetails: fieldDetail,
                  latestValue: null
                });
              }
            });

            this.metricsDetails = [ ...this.metricsDetailMap.values()];
            this.loadData();
          }
        }
      );

    });
  }

  private static isLargeMetric(metricDetail: MetricDetail): boolean {
    return metricDetail.fieldDetails.widgetType === FieldWidgetType.GAUGE;
  }

  ngOnInit(): void {
  }

  private loadData() {
    if (!this.isLoaded) {
      this.oispService.getLastValueOfAllFields(this.asset, this.fieldDetails, 600)
        .subscribe((metricPoints: PointWithId[]) => {
         this.addPointValuesToMetricsMap(metricPoints);
         this.isLoaded = true;
      });
    }
  }

  private addPointValuesToMetricsMap(metricPoints: PointWithId[]) {
    metricPoints.forEach(pointWithId => {
      if (this.metricsDetailMap.has(pointWithId.id)) {
        const metric = this.metricsDetailMap.get(pointWithId.id);
        metric.latestValue = pointWithId.value;
        this.metricsDetailMap.set(pointWithId.id, metric);

        this.metricsDetailMap = new Map(this.metricsDetailMap);
      }

      this.metricsDetails = [...this.metricsDetailMap.values()];

      this.asset.fields = [...this.metricsDetails].map(metric => {
        const fieldDetails: FieldDetails = { ...metric.fieldDetails};
        fieldDetails.value = String(metric.latestValue);
        return fieldDetails;
      });
    });

    this.groupMetricsByDashboardGroup();
    this.updateMasonryLayoutForMetricGroups();
  }

  private groupMetricsByDashboardGroup(): void {
    this.metricGroups = ArrayHelper.groupByToMap(this.metricsDetails, 'fieldDetails', 'dashboardGroup');
  }

  private updateMasonryLayoutForMetricGroups(): void {
    for (const metricGroup of this.metricGroups.values()) {
      this.updateMasonryLayout(metricGroup);
    }
  }

  private updateMasonryLayout(metricDetails: MetricDetail[]): void {
    const metricHeight = 6.4;
    const metricMarginY = 1.25;
    const numSmallItemPlacesUsed = metricDetails.length + this.getLargeMetricsCount(metricDetails);
    const numRows = Math.ceil(numSmallItemPlacesUsed / 4);
    const metricsHeight = (metricHeight + metricMarginY) *
      (numRows + (this.getLargeMetricsCount(metricDetails) > 0 && numRows === 1 ? 1 : 0));

    document.documentElement.style.setProperty('--metric-small-height', `${ metricHeight }rem`);
    document.documentElement.style.setProperty('--metric-large-height', `${ metricHeight * 2 + metricMarginY * 0.5 }rem`);
    document.documentElement.style.setProperty('--metric-margin-y', `${ metricMarginY }rem`);
    document.documentElement.style.setProperty('--metrics-masonry-height', `${ metricsHeight }rem`);

    this.orderMetricsForMasonryLayout(numRows);
  }

  private getLargeMetricsCount(metricDetails: MetricDetail[]): number {
    return metricDetails.map(metric => MetricsBoardComponent.isLargeMetric(metric) ? 1 : 0 as number)
      .reduce((accumulator, current) => accumulator + current);
  }

  private orderMetricsForMasonryLayout(numRows: number): void {
    if (numRows > 1) {
        // reverse(): to preserve original order when using pop()
        const metricsForMasonryLayout: MetricDetail[] = [];
        const remainingSmallMetrics = [...this.metricsDetails.filter(metric => !MetricsBoardComponent.isLargeMetric(metric)).reverse()];
        const remainingLargeMetrics = [...this.metricsDetails.filter(metric => MetricsBoardComponent.isLargeMetric(metric)).reverse()];

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

        this.metricsDetails = metricsForMasonryLayout;
    }
  }

  hasAnyThreshold(fieldDetail: FieldDetails): boolean {
    return fieldDetail.absoluteThreshold != null || fieldDetail.criticalThreshold != null || fieldDetail.idealThreshold != null;
  }
}

class MetricDetail {
  externalName: string;
  fieldDetails: FieldDetails;
  deviceComponent: DeviceComponent;
  latestValue: number | string;
}
