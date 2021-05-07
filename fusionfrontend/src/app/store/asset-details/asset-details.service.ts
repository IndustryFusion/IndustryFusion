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
import { environment } from '../../../environments/environment';
import { AssetDetails } from './asset-details.model';
import { map, take, tap } from 'rxjs/operators';
import { AssetDetailsStore } from './asset-details.store';
import { Room } from '../room/room.model';
import { AssetDetailsQuery } from './asset-details.query';
import { FactoryComposedQuery } from '../composed/factory-composed.query';



@Injectable({
  providedIn: 'root'
})
export class AssetDetailsService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private assetDetailsStore: AssetDetailsStore,
              private assetDetailsQuery: AssetDetailsQuery,
              private factoryComposedQuery: FactoryComposedQuery,
              private http: HttpClient) { }

  getAssetDetailsOfCompany(companyId: ID): Observable<AssetDetails[]> {
    const path = `companies/${companyId}/assetdetails`;
    const cacheKey = 'company-' + companyId;
    return this.assetDetailsStore.cachedByParentId(cacheKey,
      this.http.get<AssetDetails[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.assetDetailsStore.upsertManyByParentIdCached(cacheKey, entities);
      })));
  }

  getAssetDetails(assetDetailsId: ID): Observable<AssetDetails> {
    const path = `assetdetails/${assetDetailsId}`;
    return this.http.get<AssetDetails>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions);
  }

  updateRoomNames(room: Room) {
    this.assetDetailsQuery.selectAssetDetailsOfRoom(room.id).pipe(
      take(1),
      tap(assetsWithDetails => {
        assetsWithDetails = assetsWithDetails.map(assetWithDetails => {
          const assetWithUpdatedRoomName = Object.assign({ }, assetWithDetails);
          assetWithUpdatedRoomName.roomName = room.name;
          return assetWithUpdatedRoomName;
        });
        this.assetDetailsStore.upsertManyCached(assetsWithDetails);
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
        this.assetDetailsStore.upsertCached(assetWithUpdatedRoom);
      })
    ).subscribe();
  }

}
