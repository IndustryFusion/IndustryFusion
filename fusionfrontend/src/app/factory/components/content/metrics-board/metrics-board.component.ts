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
import { FactoryComposedQuery } from '../../../../core/store/composed/factory-composed.query';
import { FieldDetailsQuery } from '../../../../core/store/field-details/field-details.query';
import { FieldDetails, MetricDetail } from '../../../../core/store/field-details/field-details.model';
import { FactoryAssetDetailsWithFields } from '../../../../core/store/factory-asset-details/factory-asset-details.model';
import { ArrayHelper } from '../../../../core/helpers/array-helper';
import { Observable, Subject, Subscription, timer } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { takeUntil, tap } from 'rxjs/operators';
import { NgsiLdService } from '../../../../core/services/api/ngsi-ld.service';
import { ngsiLdLatestKeyValues } from '../../../../core/models/kairos.model';
//import { DetailService } from '@clr/angular/data/datagrid/providers/detail.service';

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

  private metricsDetailMap: Map<string, MetricDetail> = new Map();
  private metricsDetails: MetricDetail[] = [];

  constructor(factoryComposedQuery: FactoryComposedQuery,
              fieldDetailsQuery: FieldDetailsQuery,
              private ngsiLdService: NgsiLdService) {

    this.assetWithFields$ = factoryComposedQuery.selectActiveAssetWithFieldInstanceDetails()
      .pipe(takeUntil(this.unSubscribe$));

    this.assetWithFields$.subscribe(asset => {
      this.asset = asset;
      fieldDetailsQuery.selectMetricFieldsOfAsset(asset.id).subscribe(fieldDetails => {
          if (fieldDetails?.length > 0) {
            this.updateMetricDetails(fieldDetails);
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

  private updateMetricDetails(fieldDetails: FieldDetails[]): void {
    fieldDetails.forEach(fieldDetail => {
        this.metricsDetailMap.set(fieldDetail.name, {
          externalName: fieldDetail.externalName,
          fieldDetails: fieldDetail,
          latestValue: null
        });
    });

    this.metricsDetails = [...this.metricsDetailMap.values()];
  }

  private loadMetricsData(): void {
    this.ngsiLdService.getLatestValuesOfAsset(this.asset)
      .subscribe((keyValues: ngsiLdLatestKeyValues) => {
       this.addPointValuesToMetricsMap(keyValues);
       this.isLoaded = true;
    });
  }

  private addPointValuesToMetricsMap(keyValues: ngsiLdLatestKeyValues): void {
    Object.keys(keyValues).forEach(key => {
      if (this.metricsDetailMap.has(key)) {
        const metric = this.metricsDetailMap.get(key);
        metric.latestValue = keyValues[key];
        if (keyValues[key] !== null && typeof keyValues[key] === 'object') {
          metric.latestValue = keyValues[key].value;
        }
        this.metricsDetailMap.set(key, metric);

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
