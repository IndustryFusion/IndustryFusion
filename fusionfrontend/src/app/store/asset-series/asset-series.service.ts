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
import { AssetSeries } from './asset-series.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AssetSeriesStore } from './asset-series.store';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { ID } from '@datorama/akita';
import { AssetSeriesDetailsStore } from '../asset-series-details/asset-series-details.store';
import { Asset } from '../asset/asset.model';

@Injectable({
  providedIn: 'root'
})
export class AssetSeriesService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    params: new HttpParams()
  };

  constructor(private assetSeriesStore: AssetSeriesStore,
              private assetSeriesDetailsStore: AssetSeriesDetailsStore,
              private http: HttpClient) { }

  getAssetSeriesOfCompany(companyId: ID): Observable<AssetSeries[]> {
    const path = `companies/${companyId}/assetseries?embedChildren=true`;
    const cacheKey = 'company-' + companyId;
    return this.assetSeriesStore.cachedByParentId(cacheKey,
      this.http.get<AssetSeries[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.assetSeriesStore.upsertManyCached(entities);
      })));
  }

  getItem(companyId: ID, assetSeriesId: ID): Observable<AssetSeries> {
    const path = `companies/${companyId}/assetseries/${assetSeriesId}?embedChildren=true`;
    return this.http.get<AssetSeries>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entity => {
        this.assetSeriesStore.upsert(assetSeriesId, entity);
      }));
  }

  getAssetSeries(companyId: ID, assetSeriesId: ID): Observable<AssetSeries> {
    const path = `companies/${companyId}/assetseries/${assetSeriesId}?embedChildren=true`;
    return this.http.get<AssetSeries>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions);
  }

  createItem(companyId: ID, assetSeries: AssetSeries): Observable<AssetSeries> {
    const path = `companies/${companyId}/assetseries`;

    return this.http.post<AssetSeries>(`${environment.apiUrlPrefix}/${path}`, assetSeries, this.httpOptions)
      .pipe(tap(entity => {
          this.assetSeriesStore.upsert(entity.id, entity);
          this.assetSeriesDetailsStore.invalidateCacheParentId('company-' + entity.companyId);
        }));
  }

  initDraftFromAssetTypeTemplate(companyId: ID, assetTypeTemplateId: ID): Observable<AssetSeries> {
    const path = `companies/${companyId}/assettypetemplates/${assetTypeTemplateId}/init-asset-series-draft/?embedChildren=true`;

    return this.http.get<AssetSeries>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions);
  }

  initAssetDraft(companyId: ID, assetSeriesId: ID): Observable<Asset> {
    const path = `companies/${companyId}/assetseries/${assetSeriesId}/init-asset-draft`;
    return this.http.get<Asset>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions);
  }

  deleteItem(companyId: ID, assetSeriesId: ID): Observable<any> {
    const path = `companies/${companyId}/assetseries/${assetSeriesId}`;
    return this.http.delete(`${environment.apiUrlPrefix}/${path}`).pipe(tap({
      complete: () => {
        this.assetSeriesStore.remove(assetSeriesId);
        this.assetSeriesDetailsStore.remove(assetSeriesId);
      },
      error: (error) => {
        this.assetSeriesStore.setError(error);
      }
    }));
  }

  editItem(assetSeriesId: ID, assetSeries: AssetSeries): Observable<AssetSeries> {
    const path = `companies/${assetSeries.companyId}/assetseries/${assetSeriesId}`;
    return this.http.patch<AssetSeries>(`${environment.apiUrlPrefix}/${path}`, assetSeries, this.httpOptions)
      .pipe(
        tap(entity => {
          this.assetSeriesStore.upsert(assetSeriesId, entity);
          this.assetSeriesDetailsStore.invalidateCacheParentId('company-' + entity.companyId);
        }));
  }

}
