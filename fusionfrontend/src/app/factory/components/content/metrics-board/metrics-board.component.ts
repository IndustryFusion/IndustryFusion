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

import { Component, OnDestroy } from '@angular/core';
import { FactoryComposedQuery } from '../../../../store/composed/factory-composed.query';
import { FieldDetailsQuery } from '../../../../store/field-details/field-details.query';
import { FieldDetails, MetricDetail } from '../../../../store/field-details/field-details.model';
import { OispDeviceQuery } from '../../../../store/oisp/oisp-device/oisp-device.query';
import { OispService } from '../../../../services/oisp.service';
import { FactoryAssetDetailsWithFields } from '../../../../store/factory-asset-details/factory-asset-details.model';
import { PointWithId } from '../../../../services/oisp.model';
import { ArrayHelper } from '../../../../common/utils/array-helper';
import { Observable, Subject, Subscription, timer } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-metrics-board',
  templateUrl: './metrics-board.component.html',
  styleUrls: ['./metrics-board.component.scss']
})
export class MetricsBoardComponent implements OnDestroy {

  isLoaded = false;
  asset: FactoryAssetDetailsWithFields;

  metricGroups: Map<string, MetricDetail[]>  = new Map();

  private assetWithFields$: Observable<FactoryAssetDetailsWithFields>;
  private loadDataTimer$: Subscription;
  private unSubscribe$ = new Subject<void>();

  private fieldDetails: FieldDetails[];
  private metricsDetailMap: Map<string, MetricDetail> = new Map();
  private metricsDetails: MetricDetail[] = [];

  constructor(factoryComposedQuery: FactoryComposedQuery,
              fieldDetailsQuery: FieldDetailsQuery,
              private oispDeviceQuery: OispDeviceQuery,
              public oispService: OispService) {

    this.assetWithFields$ = factoryComposedQuery.selectActiveAssetWithFieldInstanceDetails()
      .pipe(takeUntil(this.unSubscribe$));

    this.assetWithFields$.subscribe(asset => {
      this.asset = asset;
      fieldDetailsQuery.selectMetricFieldsOfAsset(asset.id).subscribe(fieldDetails => {
          if (fieldDetails?.length > 0) {
            this.fieldDetails = fieldDetails;
            this.updateMetricDetails(fieldDetails, asset);
            this.loadMetricsData();

            this.unsubscribeFromTimerIfExisting();
            this.loadDataTimer$ = timer(0, environment.dataUpdateIntervalMs)
              .pipe(tap(() => this.loadMetricsData()))
              .subscribe();
          }
        }
      );
    });
  }

  ngOnDestroy() {
    this.unsubscribeFromTimerIfExisting();
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  private unsubscribeFromTimerIfExisting() {
    if (this.loadDataTimer$) {
      this.loadDataTimer$.unsubscribe();
    }
  }

  private updateMetricDetails(fieldDetails: FieldDetails[], asset: FactoryAssetDetailsWithFields): void {
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

    this.metricsDetails = [...this.metricsDetailMap.values()];
  }

  private loadMetricsData(): void {
    this.oispService.getLastValueOfAllFields(this.asset, this.fieldDetails, 600)
      .subscribe((metricPoints: PointWithId[]) => {
       this.addPointValuesToMetricsMap(metricPoints);
       this.isLoaded = true;
    });
  }

  private addPointValuesToMetricsMap(metricPoints: PointWithId[]): void {
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
  }

  private groupMetricsByDashboardGroup(): void {
    this.metricGroups = ArrayHelper.groupByToMap(this.metricsDetails, 'fieldDetails', 'dashboardGroup');
  }
}
