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
import { combineQueries, ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { FieldSourceQuery } from '../field-source/field-source.query';
import { map } from 'rxjs/operators';
import { AssetSeriesQuery } from '../asset-series/asset-series.query';
import { AssetSeries } from '../asset-series/asset-series.model';

@Injectable({ providedIn: 'root' })
export class AssetSeriesComposedQuery {

  constructor(protected assetSeriesQuery: AssetSeriesQuery,
              private fieldSourceQuery: FieldSourceQuery) {
  }



  selectAssetSeries(assetSeriesId: ID): Observable<AssetSeries> {
    return combineQueries([
      this.assetSeriesQuery.selectEntity(assetSeriesId),
      this.fieldSourceQuery.getAllFieldSources()
    ]).pipe(
          map(([assetSeries, fieldSources]) => {
            assetSeries = { ...assetSeries};
            assetSeries.fieldSources = fieldSources;
            return assetSeries;
            })
    );
  }

}
