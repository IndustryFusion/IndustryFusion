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
import { AssetSeriesDetailsState, AssetSeriesDetailsStore } from './asset-series-details.store';
import { Observable } from 'rxjs';
import { AssetSeriesDetails } from './asset-series-details.model';
import { BaseQueryEntity } from '../basequery';

@Injectable({ providedIn: 'root' })
export class AssetSeriesDetailsQuery extends BaseQueryEntity<AssetSeriesDetailsState, AssetSeriesDetails> {

  constructor(protected store: AssetSeriesDetailsStore) {
    super(store);
  }

  selectAssetSeriesDetailsSet(): Observable<AssetSeriesDetails[]> {
    return this.selectAll();
  }

  selectAssetSeriesDetails(assetSeriesId: ID): Observable<AssetSeriesDetails> {
    return this.selectEntity(assetSeriesId);
  }

  resetStore() {
    this.store.reset();
  }

  resetError() {
    this.store.setError(null);
  }

}
