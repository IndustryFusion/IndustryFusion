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
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { BaseQueryEntity } from '../basequery';
import { Asset } from './asset.model';
import { AssetState, AssetStore } from './asset.store';

@Injectable({ providedIn: 'root' })
export class AssetQuery extends BaseQueryEntity<AssetState, Asset> {

  private selectedAssetIds: ID[] = [];

  constructor(protected store: AssetStore) {
    super(store);
  }

  selectAssetsOfRoom(roomId: ID): Observable<Asset[]> {
    return this.selectAll({
      filterBy: entity => String(entity.roomId) === String(roomId)
    });
  }

  getSelectedAssetIds(): ID[] {
    console.log('getSelectedAssetIds: ' + this.selectedAssetIds);
    return this.selectedAssetIds;
  }

  setSelectedAssetIds(assetIds: ID[]) {
    this.selectedAssetIds = assetIds;
  }

  getSelectedAssets(): Observable<Asset[]> {
    return this.selectAll({
      filterBy: entity => this.selectedAssetIds.includes(String(entity.id))
    });
  }

  selectAssetsOfCompany(companyId: ID): Observable<Asset[]> {
    return this.selectAll({
      filterBy: entity => String(entity.companyId) === String(companyId)
    });
  }
}
