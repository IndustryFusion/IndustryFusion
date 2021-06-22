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
import { AssetSeriesDetails } from './asset-series-details.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AssetSeriesDetailsStore } from './asset-series-details-store.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { ID } from '@datorama/akita';

@Injectable({
  providedIn: 'root'
})
export class AssetSeriesDetailsService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private assetSeriesStore: AssetSeriesDetailsStore, private http: HttpClient) { }

  getAssetSeriesDetailsOfCompany(companyId: ID): Observable<AssetSeriesDetails[]> {
    const path = `companies/${companyId}/assetseriesdetails`;
    const cacheKey = 'company-' + companyId;
    return this.assetSeriesStore.cachedByParentId(cacheKey,
      this.http.get<AssetSeriesDetails[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.assetSeriesStore.upsertManyByParentIdCached(cacheKey, entities);
      })));
  }
}
