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
import { ID } from '@datorama/akita';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AssetType } from './asset-type.model';
import { AssetTypeStore } from './asset-type.store';
import { RestService } from 'src/app/services/api/rest.service';
import { AssetTypeDetailsStore } from '../asset-type-details/asset-type-details.store';
import { AssetTypeDetails } from '../asset-type-details/asset-type-details.model';
import { AssetTypeDetailsQuery } from '../asset-type-details/asset-type-details.query';

@Injectable({
  providedIn: 'root'
})
export class AssetTypeService implements RestService<AssetType> {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private assetTypeStore: AssetTypeStore,
              private assetTypeDetailsStore: AssetTypeDetailsStore,
              private assetTypeDetailsQuery: AssetTypeDetailsQuery,
              private http: HttpClient) { }

  getItems(): Observable<AssetType[]> {
    const path = `assettypes`;
    return this.http.get<AssetType[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
    .pipe(tap(entities => {
      this.assetTypeStore.upsertMany(entities);
    }));
  }

  getItem(assetTypeId: ID): Observable<AssetType> {
    const path = `assettypes/${assetTypeId}`;
    return this.http.get<AssetType>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entity => {
        this.assetTypeStore.upsert(assetTypeId, entity);
      }));
  }

  createItem(assetType: AssetType): Observable<AssetType> {
    const path = `assettypes`;
    return this.http.post<AssetType>(`${environment.apiUrlPrefix}/${path}`, assetType, this.httpOptions)
      .pipe(
        tap(entity => {
          this.assetTypeStore.upsert(entity.id, entity);

          const assetTypeDetails = AssetTypeDetails.fromAssetType(entity, 0, 0, 0);
          this.assetTypeDetailsStore.upsert(assetTypeDetails.id, assetTypeDetails);
        }));
  }

  editItem(assetTypeId: ID, assetType: AssetType): Observable<AssetType> {
    const path = `assettypes/${assetTypeId}`;
    return this.http.patch<AssetType>(`${environment.apiUrlPrefix}/${path}`, assetType, this.httpOptions)
      .pipe(
        tap(entity => {
          this.assetTypeStore.upsert(assetTypeId, entity);
          this.upsertAssetTypeDetails(entity);
        }));
  }

  private upsertAssetTypeDetails(assetType: AssetType): void {
    const assetTypeDetails = { ...this.assetTypeDetailsQuery.getEntity(assetType.id)};
    assetTypeDetails.name = assetType.name;
    assetTypeDetails.label = assetType.label;
    assetTypeDetails.description = assetType.description;
    this.assetTypeDetailsStore.upsert(assetTypeDetails.id, assetTypeDetails);
  }

  deleteItem(id: ID): Observable<any> {
    const path = `assettypes/${id}`;
    return this.http.delete(`${environment.apiUrlPrefix}/${path}`).pipe(tap({
      complete: () => {
        this.assetTypeStore.remove(id);
        this.assetTypeDetailsStore.remove(id);
      },
      error: (error) => {
        this.assetTypeStore.setError(error);
      }
    }));
  }

  setActive(assetTypeId: ID) {
    this.assetTypeStore.setActive(assetTypeId);
  }
}
