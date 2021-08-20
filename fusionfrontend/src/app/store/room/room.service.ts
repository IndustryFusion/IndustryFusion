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
import { Room } from './room.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { RoomStore } from './room.store';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Asset } from '../asset/asset.model';
import { RoomQuery } from './room.query';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private roomStore: RoomStore,
              private http: HttpClient,
              private roomQuery: RoomQuery) {
  }

  getRoomsOfCompany(companyId: ID): Observable<Room[]> {
    const path = `companies/${companyId}/rooms`;
    const cacheKey = 'company-' + companyId;
    return this.roomStore.cachedByParentId(cacheKey, this.http.get<Room[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.roomStore.upsertManyByParentIdCached(cacheKey, entities);
      })));
  }

  getRoomsOfFactorySite(companyId: ID, factorySiteId: ID, refresh: boolean = false): Observable<Room[]> {
    const path = `companies/${companyId}/factorysites/${factorySiteId}/rooms`;
    const cacheKey = 'factorysite-' + factorySiteId;
    if (refresh) {
      this.roomStore.invalidateCacheParentId(cacheKey);
    }
    return this.roomStore.cachedByParentId(cacheKey, this.http.get<Room[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.roomStore.upsertManyByParentIdCached(cacheKey, entities);
      })));
  }

  getRoom(companyId: ID, factorySiteId: ID, roomId: ID, refresh: boolean = false): Observable<Room> {
    const path = `companies/${companyId}/factorysites/${factorySiteId}/rooms/${roomId}`;
    if (refresh) {
      this.roomStore.invalidateCacheId(roomId);
    }
    return this.roomStore.cachedById(roomId, this.http.get<Room>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entity => {
        this.roomStore.upsertCached(entity);
      })));
  }

  createRoom(companyId: ID, room: Room): Observable<Room> {
    const path = `companies/${companyId}/factorysites/${room.factorySiteId}/rooms`;
    return this.http.post<Room>(`${environment.apiUrlPrefix}/${path}`, room, this.httpOptions)
      .pipe(tap(entity => {
        this.roomStore.upsertCached(entity);
      }));
  }

  deleteRoom(companyId: ID, factorySiteId: ID, roomId: ID) {
    const path = `companies/${companyId}/factorysites/${factorySiteId}/rooms/${roomId}`;
    return this.http.delete<Room>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(() => {
        this.roomStore.removeCached(roomId);
      }));
  }

  updateRoom(companyId: ID, room: Room): Observable<Room> {
    const path = `companies/${companyId}/factorysites/${room.factorySiteId}/rooms/${room.id}`;
    return this.http.put<Room>(`${environment.apiUrlPrefix}/${path}`, room, this.httpOptions)
      .pipe(tap(entity => {
        this.roomStore.upsertCached(entity);
      }));
  }

  updateRoomsAfterEditAsset(oldAssetRoomId: ID, asset: Asset) {
    this.roomStore.upsertCached(this.removeAssetFromOldRoom(oldAssetRoomId, asset));
    this.roomStore.upsertCached(this.addAssetToNewRoom(asset));
  }

  removeAssetFromOldRoom(oldAssetRoomId, asset) {
    const oldAssetRoom = { ...this.roomQuery.getAll().filter(room => room.id === oldAssetRoomId).pop() };
    oldAssetRoom.assetIds = oldAssetRoom.assetIds.filter(assetId => assetId !== asset.id);
    oldAssetRoom.assets = oldAssetRoom.assets.filter(arrayAsset => arrayAsset !== asset);

    return oldAssetRoom;
  }

  addAssetToNewRoom(asset) {
    const newAssetRoom = { ...this.roomQuery.getAll().filter(room => room.id === asset.roomId).pop() };
    const assetIdsNewAssetRoom = [...newAssetRoom.assetIds];
    const assetNewAssetRoom = [...newAssetRoom.assets];

    assetIdsNewAssetRoom.push(asset.id);
    assetNewAssetRoom.push(asset);

    newAssetRoom.assetIds = assetIdsNewAssetRoom;
    newAssetRoom.assets = assetNewAssetRoom;

    return newAssetRoom;
  }

  setActive(roomId: ID) {
    this.roomStore.setActive(roomId);
  }
}
