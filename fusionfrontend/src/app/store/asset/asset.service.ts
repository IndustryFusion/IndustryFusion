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
import { Asset } from './asset.model';
import { AssetStore } from './asset.store';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';
import { ID } from '@datorama/akita';
import { environment } from '../../../environments/environment';
import { RoomService } from '../room/room.service';
import { AssetDetailsStore } from '../asset-details/asset-details.store';
import { AssetDetailsService } from '../asset-details/asset-details.service';
import { AssetDetails } from '../asset-details/asset-details.model';


@Injectable({
  providedIn: 'root'
})
export class AssetService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private assetStore: AssetStore,
              private assetDetailsService: AssetDetailsService,
              private assetDetailsStore: AssetDetailsStore,
              private roomService: RoomService,
              private http: HttpClient) { }

  getAssetsOfCompany(companyId: ID): Observable<Asset[]> {
    const path = `companies/${companyId}/assets`;
    const cacheKey = 'company-' + companyId;
    return this.assetStore.cachedByParentId(cacheKey, this.http.get<Asset[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.assetStore.upsertManyByParentIdCached(cacheKey, entities);
      })));
  }

  getAssetOfCompany(companyId: ID, assetId: ID): Observable<Asset> {
    const path = `companies/${companyId}/assets/${assetId}`;
    return this.assetStore.cachedById(assetId, this.http.get<Asset>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entity => {
        this.assetStore.upsertCached(entity);
      })));
  }

  getAssetsOfLocation(companyId: ID, locationId: ID): Observable<Asset[]> {
    const path = `companies/${companyId}/locations/${locationId}/assets`;
    const cacheKey = 'location-' + companyId;
    return this.assetStore.cachedByParentId(cacheKey, this.http.get<Asset[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.assetStore.upsertManyByParentIdCached(cacheKey, entities);
      })));
}

  getAssetsOfRoom(companyId: ID, locationId: ID, roomId: ID): Observable<Asset[]> {
    const path = `companies/${companyId}/locations/${locationId}/rooms/${roomId}/assets`;
    const cacheKey = 'room-' + companyId;
    return this.assetStore.cachedByParentId(cacheKey, this.http.get<Asset[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.assetStore.upsertManyByParentIdCached(cacheKey, entities);
      })));
  }

  getAssetOfRoom(companyId: ID, locationId: ID, roomId: ID, assetId: ID): Observable<Asset> {
    const path = `companies/${companyId}/locations/${locationId}/rooms/${roomId}/assets/${assetId}`;
    return this.assetStore.cachedById(assetId, this.http.get<Asset>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entity => {
        this.assetStore.upsertCached(entity);
      })));
  }

  assignAssetToRoom(companyId: ID, locationId: ID, newRoomId: ID, oldRoomId: ID, assetId: ID): Observable<Asset> {
    const path = `companies/${companyId}/locations/${locationId}/rooms/${newRoomId}/assets/${assetId}`;
    return this.http.put<Asset>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entity => {
        this.assetStore.upsertCached(entity);
        // Refresh rooms
        this.roomService.getRoom(companyId, locationId, newRoomId, true).subscribe();
        this.roomService.getRoom(companyId, locationId, oldRoomId, true).subscribe();
      }));
  }

  createAssetFromAssetSeries(targetCompanyId: ID, assetSeriesId: ID, sourceCompanyId: ID): Observable<ID> {
    const path = `companies/${targetCompanyId}/assetseries/${assetSeriesId}/company/${sourceCompanyId}`;
    return this.http.post<Asset>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions).pipe(
      switchMap(asset => {
        console.log('new asset id ' + asset.id);
        this.assetStore.upsertCached(asset);
        const assetDetails = this.assetDetailsService.getAssetDetails(asset.id).pipe(tap(entity => {
          this.assetDetailsStore.upsertCached(entity);
        }));
        return assetDetails.pipe(map(entity => entity.id));
      })
    );
  }

  setActive(assetId: ID) {
    this.assetStore.setActive(assetId);
  }

  updateCompanyAsset(companyId: ID, assetDetails: AssetDetails): Observable<Asset> {
    const path = `companies/${companyId}/assets/${assetDetails.id}`;
    const asset: Asset = this.mapAssetDetailsToAsset(assetDetails);
    return this.http.patch<Asset>(`${environment.apiUrlPrefix}/${path}`, asset, this.httpOptions)
      .pipe(
        switchMap(updatedAsset => {
            console.log('updated asset with id ' + updatedAsset.id);
            this.assetStore.upsertCached(updatedAsset);
            const updatedAssetDetails = this.assetDetailsService.getAssetDetails(updatedAsset.id).pipe(tap(entity => {
              this.assetDetailsStore.upsertCached(entity);
            }));
            return updatedAssetDetails;
          })

      );
  }

  removeCompanyAsset(companyId: ID, assetId: ID): Observable<any> {
    const path = `companies/${companyId}/assets/${assetId}`;
    return this.http.delete(`${environment.apiUrlPrefix}/${path}`).pipe(tap({
      complete: () => {
        console.log('delete asset with id ' + assetId);
        this.assetStore.removeCached(assetId);
        this.assetDetailsStore.removeCached(assetId);
      },
      error: (error) => {
        this.assetStore.setError(error);
      }
    }));
  }

  mapAssetDetailsToAsset(assetDetails: AssetDetails): Asset {
    const mappedAsset = new Asset();
    mappedAsset.id = assetDetails.id;
    mappedAsset.companyId = assetDetails.companyId;
    mappedAsset.roomId = assetDetails.roomId;
    mappedAsset.externalId = assetDetails.externalId;
    mappedAsset.controlSystemType = assetDetails.controlSystemType;
    mappedAsset.hasGateway =  assetDetails.hasGateway;
    mappedAsset.name = assetDetails.name;
    mappedAsset.description = assetDetails.description;
    mappedAsset.guid = assetDetails.guid;
    mappedAsset.ceCertified = assetDetails.ceCertified;
    mappedAsset.serialNumber = assetDetails.serialNumber;
    mappedAsset.constructionDate = assetDetails.constructionDate;
    mappedAsset.protectionClass = assetDetails.protectionClass;
    mappedAsset.handbookKey = assetDetails.handbookKey;
    mappedAsset.videoKey = assetDetails.videoKey;
    mappedAsset.installationDate = assetDetails.installationDate;
    mappedAsset.imageKey = assetDetails.imageKey;
    return mappedAsset;
  }
}
