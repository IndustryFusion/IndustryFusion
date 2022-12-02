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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AssetTypeDetails } from './asset-type-details.model';
import { AssetTypeDetailsStore } from './asset-type-details.store';
import { RestService } from '../../services/api/rest.service';

@Injectable({
  providedIn: 'root'
})
export class AssetTypeDetailsService implements RestService<AssetTypeDetails> {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private assetTypeDetailsStore: AssetTypeDetailsStore, private http: HttpClient) { }

  getItems(): Observable<AssetTypeDetails[]> {
    const path = `assettypes/details`;
    return this.http.get<AssetTypeDetails[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.assetTypeDetailsStore.upsertManyCached(entities);
      }));
  }

  /**
   * Caution: Completes observable directly (no next-call) if data exist in cache.
   */
  getItem(assetTypeDetailsId: ID): Observable<AssetTypeDetails> {
    const path = `assettypes/details/${assetTypeDetailsId}`;
    return this.assetTypeDetailsStore
      .cachedById(assetTypeDetailsId,
        this.http.get<AssetTypeDetails>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entity => {
        this.assetTypeDetailsStore.upsertCached(entity);
      })));
  }

  setActive(assetTypeId: ID) {
    this.assetTypeDetailsStore.setActive(assetTypeId);
  }

  createItem(assetTypeDetails: AssetTypeDetails): Observable<AssetTypeDetails> {
    const path = `assettypes/details`;
    return this.http.post<AssetTypeDetails>(`${environment.apiUrlPrefix}/${path}`, assetTypeDetails, this.httpOptions)
      .pipe(
        tap(entity => {
          this.assetTypeDetailsStore.upsert(entity.id, entity);
        }));
  }

  editItem(assetTypeDetailsId: ID, assetType: AssetTypeDetails): Observable<AssetTypeDetails> {
    const path = `assettypes/details/${assetTypeDetailsId}`;
    return this.http.patch<AssetTypeDetails>(`${environment.apiUrlPrefix}/${path}`, assetType, this.httpOptions)
      .pipe(
        tap(entity => {
          this.assetTypeDetailsStore.upsert(assetTypeDetailsId, entity);
        }));
  }

  deleteItem(id: ID): Observable<any> {
    const path = `assettypes/details/${id}`;
    return this.http.delete(`${environment.apiUrlPrefix}/${path}`).pipe(tap({
      complete: () => {
        this.assetTypeDetailsStore.remove(id);
      },
      error: (error) => {
        this.assetTypeDetailsStore.setError(error);
      }
    }));
  }
}
