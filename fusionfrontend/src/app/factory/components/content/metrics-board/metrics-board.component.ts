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

@Component({
  selector: 'app-metrics-board',
  templateUrl: './metrics-board.component.html',
  styleUrls: ['./metrics-board.component.scss']
})
export class MetricsBoardComponent implements OnInit {
  fieldDetails: FieldDetails[];
  metricsDetailMap: Map<string, MetricsDetail> = new Map();
  asset: FactoryAssetDetailsWithFields;
  isLoaded = false;
  metricsDetails: MetricsDetail[] = [];

  WidgetType = FieldWidgetType;
  maintenanceUtils = AssetMaintenanceUtils;

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
              this.metricsDetailMap.set(deviceComponent.cid, {
                externalName: fieldDetail.externalName,
                deviceComponent,
                fieldDetail,
                latestValue: null
              });
            });
            this.metricsDetails = [ ...this.metricsDetailMap.values()];
            this.loadData();
          }
        }
      );

    });
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
      this.asset.fields = [...this.metricsDetailMap.values()].map(metric => {
        const fieldDetail: FieldDetails = { ...metric.fieldDetail};
        fieldDetail.value = String(metric.latestValue);
        return fieldDetail;
      });
    });
  }
}

class MetricsDetail {
  externalName: string;
  fieldDetail: FieldDetails;
  deviceComponent: DeviceComponent;
  latestValue: number | string;
}
