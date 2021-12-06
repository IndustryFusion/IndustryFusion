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

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FactoryAssetDetails } from './factory-asset-details.model';
import { map, take, tap } from 'rxjs/operators';
import { FactoryAssetDetailsStore } from './factory-asset-details.store';
import { Room } from '../room/room.model';
import { FactoryAssetDetailsQuery } from './factory-asset-details.query';
import { FactoryComposedQuery } from '../composed/factory-composed.query';


@Injectable({
  providedIn: 'root'
})
export class FactoryAssetDetailsService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private factoryAssetDetailsStore: FactoryAssetDetailsStore,
              private factoryAssetDetailsQuery: FactoryAssetDetailsQuery,
              private factoryComposedQuery: FactoryComposedQuery,
              private http: HttpClient) { }

  getAssetDetailsOfCompany(companyId: ID): Observable<FactoryAssetDetails[]> {
    const path = `companies/${companyId}/factoryassetdetails`;
    const cacheKey = 'company-' + companyId;
    return this.factoryAssetDetailsStore.cachedByParentId(cacheKey,
      this.http.get<FactoryAssetDetails[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.factoryAssetDetailsStore.upsertManyByParentIdCached(cacheKey, entities);
      })));
  }

  getAssetDetails(companyId: ID, assetDetailsId: ID): Observable<FactoryAssetDetails> {
    const path = `companies/${companyId}/factoryassetdetails/${assetDetailsId}`;
    return this.http.get<FactoryAssetDetails>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions);
  }

  updateRoomNames(room: Room) {
    this.factoryAssetDetailsQuery.selectAssetDetailsOfRoom(room.id).pipe(
      take(1),
      tap(assetsWithDetails => {
        assetsWithDetails = assetsWithDetails.map(assetWithDetails => {
          const assetWithUpdatedRoomName = Object.assign({ }, assetWithDetails);
          assetWithUpdatedRoomName.roomName = room.name;
          return assetWithUpdatedRoomName;
        });
        this.factoryAssetDetailsStore.upsertManyCached(assetsWithDetails);
      }
      )
    ).subscribe();
  }

  updateRoom(assetDetailsId: ID, roomId: ID) {
    this.factoryComposedQuery.selectAssetDetailsAndRoom(assetDetailsId, roomId).pipe(
      take(1),
      map(([assetDetails, room]) => {
        const assetWithUpdatedRoom = Object.assign({ }, assetDetails);
        assetWithUpdatedRoom.roomName = room.name;
        assetWithUpdatedRoom.roomId = room.id;
        this.factoryAssetDetailsStore.upsertCached(assetWithUpdatedRoom);
      })
    ).subscribe();
  }

  public setActive(id: ID) {
    this.factoryAssetDetailsStore.setActive(id);
  }
}
