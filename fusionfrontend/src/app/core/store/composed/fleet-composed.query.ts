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
import { combineQueries } from '@datorama/akita';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OispService } from '../../services/api/oisp.service';
import { AssetQuery } from '../asset/asset.query';
import { FieldDetailsQuery } from '../field-details/field-details.query';
import { FleetAssetDetailsQuery } from '../fleet-asset-details/fleet-asset-details.query';
import { FleetAssetDetailsWithFields } from '../fleet-asset-details/fleet-asset-details.model';
import { Asset, AssetWithFields } from '../asset/asset.model';

@Injectable({ providedIn: 'root' })
export class FleetComposedQuery {
  constructor(
    protected assetQuery: AssetQuery,
    protected fleetAssetDetailsQuery: FleetAssetDetailsQuery,
    protected fieldDetailsQuery: FieldDetailsQuery,
    protected oispService: OispService) { }

  /**
   * @description Do not forget to unsubscribe when component is destroyed.
   */
  selectActivesAssetWithFieldInstanceDetails(): Observable<FleetAssetDetailsWithFields> {
    return combineQueries([
      // Wait here for multiple actives (not the first as elsewhere) to get asset detail info updated when a subsystem is selected
      this.fleetAssetDetailsQuery.waitForActives(),
      this.fieldDetailsQuery.selectAll()
    ]).pipe(
      map(([activeAsset, fieldDetails]) => {
        const filteredFields = fieldDetails.filter(field => field.assetId === activeAsset.id);
        return Object.assign({ fields: filteredFields}, activeAsset);
      })
    );
  }

  selectFieldsOfAssetsDetailsOfActivesAsset(): Observable<FleetAssetDetailsWithFields> {
    return combineQueries([
      this.fleetAssetDetailsQuery.waitForActives(),
      this.fieldDetailsQuery.selectAll()
    ]).pipe(
      map(([assetDetails, fields]) => {
        const filteredFields = fields.filter(field => field.assetId === assetDetails.id);
        return Object.assign({ fields: filteredFields }, assetDetails);
      })
    );
  }

  joinAssetAndFieldInstanceDetails(asset: Asset): Observable<AssetWithFields> {
    return this.fieldDetailsQuery.selectFieldsOfAsset(asset.id).pipe(
      map(fieldDetails => {
        const assetWithFieldDetails: AssetWithFields = Object.assign({ fields: fieldDetails }, asset);
        return assetWithFieldDetails;
      })
    );
  }
}
