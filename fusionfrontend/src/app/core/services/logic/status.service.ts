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

import { Injectable } from '@angular/core';
import { FieldDetails } from 'src/app/core/store/field-details/field-details.model';
import { Status, StatusWithAssetId } from '../../../factory/models/status.model';
import { AssetWithFields } from 'src/app/core/store/asset/asset.model';
import { FactoryAssetDetailsWithFields } from '../../store/factory-asset-details/factory-asset-details.model';
import { combineLatest, forkJoin, Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { OispService } from '../api/oisp.service';
import { OispDeviceStatus } from '../../models/kairos.model';
import { AssetStatusPipe } from '../../../shared/pipes/asset-status-pipe';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  constructor(private oispService: OispService) {
  }

  determineStatus(fields: FieldDetails[]): Status {
    if (fields.length <= 0) {
      return ({ gotData: false, statusValue: 'none'});
    }
    let gotAnyValues = false;
    fields.forEach( field => {
      if (field.value) {
        gotAnyValues = true;
      }
    });

    if (!gotAnyValues) {
      return ({ gotData: false, statusValue: 'none'});
    } else {
      return ({ gotData: true, statusValue: this.getStatusValue(fields)});
    }
  }

  getStatusValue(fields: FieldDetails[]): string {
    const assetStatusField = fields.filter(field => field.externalName === 'status')[0];
    if (assetStatusField) {
      return assetStatusField?.value;
    } else {
      return '';
    }
  }

  getStatusesByAssetsWithFields(factoryAssetsWithFields$: Observable<FactoryAssetDetailsWithFields[]>): Observable<StatusWithAssetId[]> {
    return combineLatest([factoryAssetsWithFields$, timer(0, environment.dataUpdateIntervalMs)]).pipe(
      switchMap(([assetsWithFields, _]) =>
        forkJoin(assetsWithFields.map(assetWithFields => this.getStatusByAssetWithFields(assetWithFields, null).pipe(
          map((assetStatus) => {
            return { factoryAssetId: assetWithFields.id, status: assetStatus };
          })
        )))
      )
    );
  }

  getStatusByAssetWithFields(assetWithFields: FactoryAssetDetailsWithFields | AssetWithFields, period: number): Observable<Status> {
    const mergedFields$ = this.oispService.getMergedFieldsByAssetWithFields(assetWithFields, period);
    return this.getStatusFromMergedFields(mergedFields$);
  }

  getStatusFromMergedFields(mergedFields$: Observable<FieldDetails[]>): Observable<Status> {
    return mergedFields$.pipe(
      map((fields) => {
        return this.determineStatus(fields);
      })
    );
  }

  transformStatusToOispDeviceStatus(status: Status): OispDeviceStatus {
    const assetStatusPipe = new AssetStatusPipe();
    const statusString = assetStatusPipe.transform(status.gotData, status.statusValue).status;

    switch (statusString) {
      case 'offline':
        return OispDeviceStatus.OFFLINE;
      case 'idle':
        return OispDeviceStatus.IDLE;
      case 'running':
        return OispDeviceStatus.RUNNING;
      default:
        return OispDeviceStatus.ERROR;
    }
  }
}
