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
import {FactoryComposedQuery} from "../../../../store/composed/factory-composed.query";
import {FieldDetailsQuery} from "../../../../store/field-details/field-details.query";
import {FieldDetails} from "../../../../store/field-details/field-details.model";
import {OispDeviceQuery} from "../../../../store/oisp/oisp-device/oisp-device.query";
import {DeviceComponent} from "../../../../store/oisp/oisp-device/oisp-device.model";
import {OispService} from "../../../../services/oisp.service";
import {FactoryAssetDetailsWithFields} from "../../../../store/factory-asset-details/factory-asset-details.model";
import {PointWithId} from "../../../../services/oisp.model";

@Component({
  selector: 'app-metrics-board',
  templateUrl: './metrics-board.component.html',
  styleUrls: ['./metrics-board.component.scss']
})
export class MetricsBoardComponent implements OnInit {
  fieldDetails: FieldDetails[];
  metrics: Map<string,{externalName:string, fieldDetail: FieldDetails, deviceComponent: DeviceComponent, latesValue:number|string}> = new Map();
  private asset: FactoryAssetDetailsWithFields;
  isLoading = true;
  data: { externalName: string; fieldDetail: FieldDetails; deviceComponent: DeviceComponent; latesValue: number | string }[] = [];

  constructor(
    factoryComposedQuery: FactoryComposedQuery,
    fieldDetailsQuery: FieldDetailsQuery,
    oispDeviceQuery: OispDeviceQuery,
    public oispService: OispService,
  ) {
    factoryComposedQuery.selectActiveAssetsWithFieldInstanceDetails().subscribe(asset => {
      this.asset = asset;
      fieldDetailsQuery.selectFieldsOfAssetMetrics(asset.id).subscribe(fieldDetails => {
          if (fieldDetails?.length > 0) {
            this.fieldDetails = fieldDetails;
            fieldDetails.forEach(fieldDetail => {
              const deviceComponent = oispDeviceQuery.getComponentOfFieldInstance(asset.externalName, fieldDetail.externalName);
              this.metrics.set(fieldDetail.externalName, {
                externalName: fieldDetail.externalName,
                deviceComponent,
                fieldDetail,
                latesValue: null
              })
            })
            this.data = [ ...this.metrics.values()]
            //this.loadData();
          }
        }
      )

    })
  }

  ngOnInit(): void {
this.loadData()
  }

  private loadData() {
    console.log('loadData')

    if (this.isLoading) {
      this.isLoading = false;
      this.oispService.getLastValueOfAllFields(
        this.asset,
        [...this.metrics.values()].map(metric => metric.fieldDetail),
        600).subscribe((data: PointWithId[]) => data.forEach(pointWithId => {
        console.log(pointWithId);
        if (this.metrics.has(pointWithId.id)) {
          const metric = this.metrics.get(pointWithId.id);
          metric.latesValue = pointWithId.value;
          this.metrics.set(pointWithId.id, metric);
          this.metrics = new Map(this.metrics);
        }
        this.data = [ ...this.metrics.values()]
      }))
    }
  }
}
