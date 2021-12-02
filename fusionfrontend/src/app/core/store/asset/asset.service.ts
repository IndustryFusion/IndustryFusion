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
import { map, switchMap, tap } from 'rxjs/operators';
import { ID } from '@datorama/akita';
import { environment } from '../../../../environments/environment';
import { RoomService } from '../room/room.service';
import { FactoryAssetDetailsService } from '../factory-asset-details/factory-asset-details.service';
import {
  FactoryAssetDetails,
  FactoryAssetDetailsWithFields
} from '../factory-asset-details/factory-asset-details.model';
import { FactorySiteService } from '../factory-site/factory-site.service';
import { AssetSeriesDetailsService } from '../asset-series-details/asset-series-details.service';
import { PointWithId } from '../../services/api/oisp.model';
import { FieldDetails } from '../field-details/field-details.model';
import { OispService } from '../../services/api/oisp.service';
import { FleetAssetDetailsService } from '../fleet-asset-details/fleet-asset-details.service';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  DEFAULT_OISP_LOOKBACK_TIME = 600;

  constructor(private assetStore: AssetStore,
              private assetSeriesDetailsService: AssetSeriesDetailsService,
              private factoryAssetDetailsService: FactoryAssetDetailsService,
              private fleetAssetDetailsService: FleetAssetDetailsService,
              private factorySiteService: FactorySiteService,
              private roomService: RoomService,
              private oispService: OispService,
              private http: HttpClient) {
  }

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

  getAssetsOfFactorySite(companyId: ID, factorySiteId: ID): Observable<Asset[]> {
    const path = `companies/${companyId}/factorysites/${factorySiteId}/assets`;
    const cacheKey = 'factorysite-' + factorySiteId;
    return this.assetStore.cachedByParentId(cacheKey, this.http.get<Asset[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.assetStore.upsertManyByParentIdCached(cacheKey, entities);
      })));
  }

  getAssetsOfRoom(companyId: ID, factorySiteId: ID, roomId: ID): Observable<Asset[]> {
    const path = `companies/${companyId}/factorysites/${factorySiteId}/rooms/${roomId}/assets`;
    const cacheKey = 'room-' + companyId; // TODO: should it be 'room-' + roomId?
    return this.assetStore.cachedByParentId(cacheKey, this.http.get<Asset[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.assetStore.upsertManyByParentIdCached(cacheKey, entities);
      })));
  }

  getAssetOfRoom(companyId: ID, factorySiteId: ID, roomId: ID, assetId: ID): Observable<Asset> {
    const path = `companies/${companyId}/factorysites/${factorySiteId}/rooms/${roomId}/assets/${assetId}`;
    return this.assetStore.cachedById(assetId, this.http.get<Asset>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entity => {
        this.assetStore.upsertCached(entity);
      })));
  }

  assignAssetsToRoom(companyId: ID, factorySiteId: ID, roomId: ID, assets: Asset[]): Observable<Asset[]> {
    const path = `companies/${companyId}/factorysites/${factorySiteId}/rooms/${roomId}/assets/assign`;
    return this.http.put<Asset[]>(`${environment.apiUrlPrefix}/${path}`, assets, this.httpOptions)
      .pipe(tap(entities => {
        entities.forEach(asset => {
          this.assetStore.upsertCached(asset);
          this.factoryAssetDetailsService.updateRoom(asset.id, asset.roomId);
        });
      }));
  }

  assignAssetToRoom(companyId: ID, factorySiteId: ID, newRoomId: ID, oldRoomId: ID, assetId: ID): Observable<Asset> {
    const path = `companies/${companyId}/factorysites/${factorySiteId}/rooms/${newRoomId}/assets/${assetId}/assign`;
    return this.http.put<Asset>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entity => {
        this.assetStore.upsertCached(entity);
        // Refresh rooms
        this.roomService.getRoom(companyId, factorySiteId, newRoomId, true).subscribe();
        this.roomService.getRoom(companyId, factorySiteId, oldRoomId, true).subscribe();
      }));
  }

  createFleetAsset(companyId: ID, assetSeriesId: ID, asset: Asset): Observable<ID> {
    const path = `companies/${companyId}/assetseries/${assetSeriesId}/assets`;
    return this.http.post<Asset>(`${environment.apiUrlPrefix}/${path}`, asset, this.httpOptions)
      .pipe(
        switchMap(savedAsset => {
          this.assetStore.upsertCached(savedAsset);

          const assetDetails$ = this.fleetAssetDetailsService.getFleetAssetDetails(savedAsset.companyId, savedAsset.id);

          this.assetSeriesDetailsService.getAssetSeriesDetailsOfCompany(savedAsset.companyId, true).subscribe();
          if (savedAsset.room) {
            this.factorySiteService.getFactorySiteWithoutShiftSettings(savedAsset.companyId, savedAsset.room.factorySite.id).subscribe();
            this.roomService.getRoom(savedAsset.companyId, savedAsset.room.factorySite.id, savedAsset.roomId, false)
              .subscribe();
          }
          return assetDetails$.pipe(map(entity => entity.id));
        })
      );
  }

  setActive(assetId: ID) {
    this.assetStore.setActive(assetId);
  }

  editFactoryAsset(companyId: ID, assetDetails: FactoryAssetDetails): Observable<Asset> {
    const path = `companies/${assetDetails.companyId}/assets/${assetDetails.id}`;
    const asset: Asset = this.mapAssetDetailsToAsset(assetDetails);
    return this.http.put<Asset>(`${environment.apiUrlPrefix}/${path}`, asset, this.httpOptions)
      .pipe(
        switchMap(updatedAsset => {
          this.assetStore.upsertCached(updatedAsset);
          return this.factoryAssetDetailsService.getFactoryAssetDetails(companyId, updatedAsset.id);
        })
      );
  }

  editFleetAsset(assetSeriesId: ID, asset: Asset): Observable<Asset> {
    const path = `companies/${asset.companyId}/assetseries/${assetSeriesId}/assets/${asset.id}`;
    return this.http.put<Asset>(`${environment.apiUrlPrefix}/${path}`, asset, this.httpOptions)
      .pipe(
        tap(updatedAsset => {
          this.assetStore.upsertCached(updatedAsset);
          this.fleetAssetDetailsService.getFleetAssetDetails(asset.companyId, updatedAsset.id).subscribe();
          return updatedAsset;
        }));
  }

  removeCompanyAsset(companyId: ID, assetId: ID): Observable<any> {
    const path = `companies/${companyId}/assets/${assetId}`;
    return this.http.delete(`${environment.apiUrlPrefix}/${path}`).pipe(tap({
      complete: () => {
        this.assetStore.removeCached(assetId);
        this.factoryAssetDetailsService.deleteItem(assetId);
      },
      error: (error) => {
        console.error(error);
        this.assetStore.setError(error);
      }
    }));
  }

  mapAssetDetailsToAsset(assetDetails: FactoryAssetDetails): Asset {
    const mappedAsset = new Asset();
    mappedAsset.id = assetDetails.id;
    mappedAsset.companyId = assetDetails.companyId;
    mappedAsset.roomId = assetDetails.roomId;
    mappedAsset.externalName = assetDetails.externalName;
    mappedAsset.controlSystemType = assetDetails.controlSystemType;
    mappedAsset.hasGateway = assetDetails.hasGateway;
    mappedAsset.name = assetDetails.name;
    mappedAsset.description = assetDetails.description;
    mappedAsset.guid = assetDetails.guid;
    mappedAsset.ceCertified = assetDetails.ceCertified;
    mappedAsset.serialNumber = assetDetails.serialNumber;
    mappedAsset.constructionDate = assetDetails.constructionDate;
    mappedAsset.protectionClass = assetDetails.protectionClass;
    mappedAsset.manualKey = assetDetails.manualKey;
    mappedAsset.videoKey = assetDetails.videoKey;
    mappedAsset.installationDate = assetDetails.installationDate;
    mappedAsset.imageKey = assetDetails.imageKey;
    mappedAsset.subsystemIds = assetDetails.subsystemIds;
    mappedAsset.connectionString = assetDetails.connectionString;
    return mappedAsset;
  }

  // tslint:disable-next-line: max-line-length
  updateAssetWithFieldValues(asset: FactoryAssetDetailsWithFields, secondsInPast: number = this.DEFAULT_OISP_LOOKBACK_TIME): Observable<FactoryAssetDetailsWithFields> {
    return new Observable<any>((observer) => {
      this.oispService.getLastValueOfAllFields(asset, asset.fields, secondsInPast, true).subscribe((lastValues) => {
          asset.fields = this.getAssetFieldValues(asset, lastValues);
          observer.next(asset);
        }, _ => {
          observer.next(null);
        }
      );
    });
  }

  getAssetFieldValues(asset: FactoryAssetDetailsWithFields, lastValues: PointWithId[]): FieldDetails[] {
    return asset.fields.map((field) => {
        const fieldCopy = Object.assign({ }, field);
        const point = lastValues?.find(latestPoint => latestPoint.id === field.externalName);
        if (point) {
          fieldCopy.value = point.value;
        }
        return fieldCopy;
      }
    );
  }

  getExportLink(assetId: ID, companyId: ID):string {
    const path = `companies/${companyId}/assets/${assetId}/ngsi-ld`;
    return `${environment.apiUrlPrefix}${path}`;
  }
}
