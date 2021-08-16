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
import { forkJoin, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { OispService } from '../../services/oisp.service';
import { FactoryAssetDetails, FactoryAssetDetailsWithFields } from '../factory-asset-details/factory-asset-details.model';
import { FactoryAssetDetailsQuery } from '../factory-asset-details/factory-asset-details.query';
import { Asset, AssetWithFields } from '../asset/asset.model';
import { AssetQuery } from '../asset/asset.query';
import { FieldDetailsQuery } from '../field-details/field-details-query.service';
import { FactorySiteWithAssetCount } from '../factory-site/factory-site.model';
import { FactorySiteQuery } from '../factory-site/factory-site.query';
import { Room } from '../room/room.model';
import { RoomQuery } from '../room/room.query';

@Injectable({ providedIn: 'root' })
export class FactoryComposedQuery {
  constructor(
    protected factorySiteQuery: FactorySiteQuery,
    protected roomQuery: RoomQuery,
    protected assetQuery: AssetQuery,
    protected factoryAssetDetailsQuery: FactoryAssetDetailsQuery,
    protected fieldQuery: FieldDetailsQuery,
    protected oispService: OispService) { }

  selectAssetsOfFactorySite(factorySiteId: ID): Observable<Asset[]> {
    return combineQueries([
      this.assetQuery.selectAll(),
      this.roomQuery.selectRoomsOfFactorySite(factorySiteId)])
      .pipe(
        map(([assets, rooms]) => {
          return assets.filter(asset => rooms.find(room => String(room.id) === String(asset.roomId)));
        }));
  }

  selectFactorySitesOfCompanyWithAssetCountInFactoryManager(companyId: ID): Observable<FactorySiteWithAssetCount[]> {
    return combineQueries([
      this.factorySiteQuery.selectFactorySitesOfCompanyInFactoryManager(companyId),
      this.selectRoomsOfCompanyInFactoryManager(companyId),
      this.assetQuery.selectAssetsOfCompany(companyId)])
      .pipe(
        map(([factorySites, rooms, assets]) =>
          factorySites.map(factorySite => {
            const assetCount =
              assets.filter(
                asset => String(rooms.find(room => String(room.id) === String(asset.roomId))?.factorySiteId)
                  === String(factorySite.id)).length;
            return Object.assign({ assetCount }, factorySite);
          }))
      );
  }

  selectRoomsOfCompanyInFactoryManager(companyId: ID): Observable<Room[]> {
    return combineQueries([
      this.roomQuery.selectAll(),
      this.factorySiteQuery.selectFactorySitesOfCompanyInFactoryManager(companyId)])
      .pipe(
        map(([rooms, factorySites]) =>
          rooms.filter(room => factorySites.find(factorySite => String(factorySite.id) === String(room.factorySiteId)))));
  }

  selectFieldsOfSelectedAssets(): Observable<AssetWithFields[]> {
    return combineQueries([
      this.assetQuery.getSelectedAssets(),
      this.fieldQuery.selectAll()
    ]).pipe(
      map(([assets, fields]) =>
        assets.map(asset => {
          const filteredFields = fields.filter(field => field.assetId === asset.id);
          return Object.assign({ fields: filteredFields }, asset);
        })
      )
    );
  }

  selectFieldsOfAssetsDetails(): Observable<FactoryAssetDetailsWithFields[]> {
    return combineQueries([
      this.factoryAssetDetailsQuery.selectAll(),
      this.fieldQuery.selectAll()
    ]).pipe(
      map(([assetsDetails, fields]) =>
        assetsDetails.map(assetDetails => {
          const filteredFields = fields.filter(field => field.assetId === assetDetails.id);
          return Object.assign({ fields: filteredFields }, assetDetails);
        })
      )
    );
  }

  selectAssetDetailsOfFactorySite(factorySiteId: ID): Observable<FactoryAssetDetails[]> {
    return combineQueries([
      this.factoryAssetDetailsQuery.selectAll(),
      this.roomQuery.selectRoomsOfFactorySite(factorySiteId)])
     .pipe(
        map(([assetDetailsArray, rooms]) => {
          return assetDetailsArray.filter(assetDetails => rooms.find(room => String(room.id) === String(assetDetails.roomId)));
       }));
  }


  selectFieldsOfAssetsDetailsByFactorySiteId(factorySiteId: ID): Observable<FactoryAssetDetailsWithFields[]> {
    return combineQueries([
      this.selectAssetDetailsOfFactorySite(factorySiteId),
      this.fieldQuery.selectAll()
    ]).pipe(
      map(([assetsDetails, fields]) =>
        assetsDetails.map(assetDetails => {
          const filteredFields = fields.filter(field => field.assetId === assetDetails.id);
          return Object.assign({ fields: filteredFields }, assetDetails);
        })
      )
    );
  }

  selectFieldsOfAssetsDetailsByRoomId(roomId: ID): Observable<FactoryAssetDetailsWithFields[]> {
    return combineQueries([
      this.factoryAssetDetailsQuery.selectAssetDetailsOfRoom(roomId),
      this.fieldQuery.selectAll()
    ]).pipe(
      map(([assetsDetails, fields]) =>
        assetsDetails.map(assetDetails => {
          const filteredFields = fields.filter(field => field.assetId === assetDetails.id);
          return Object.assign({ fields: filteredFields }, assetDetails);
        })
      )
    );
  }

  selectAssetDetailsAndRoom(assetDetailsId: ID, roomId: ID): Observable<[FactoryAssetDetails, Room]> {
    return combineQueries([
      this.factoryAssetDetailsQuery.selectEntity(assetDetailsId),
      this.roomQuery.selectEntity(roomId)
    ]).pipe(map(([assetDetails, room]) => {
      return [assetDetails, room];
    }));
  }

  joinFieldsOfAssetsWithOispData(): Observable<AssetWithFields[]> {
    return this.selectFieldsOfSelectedAssets().pipe(
      mergeMap(assets =>
        forkJoin(
          assets.map(asset => this.oispService.getAssetFieldsWithReplacedExternalIds(asset)))
      )
    );
  }

  joinFieldsOfAssetsDetailsWithOispData(): Observable<FactoryAssetDetailsWithFields[]> {
    return this.selectFieldsOfAssetsDetails().pipe(
      mergeMap(assets =>
        forkJoin(
          assets.map(asset => this.oispService.getAssetDetailsFieldsWithReplacedExternalIds(asset))
        )
      )
    );
  }

  selectAssetDetailsWithFieldsOfFactorySiteAndOispData(factorySiteId): Observable<FactoryAssetDetailsWithFields[]> {
    return this.selectFieldsOfAssetsDetailsByFactorySiteId(factorySiteId).pipe(
      mergeMap(assets =>
        forkJoin(
          assets.map(asset => this.oispService.getAssetDetailsFieldsWithReplacedExternalIds(asset))
        )
      ));
  }

  selectAssetDetailsWithFieldsOfRoomAndJoinWithOispData(roomId): Observable<FactoryAssetDetailsWithFields[]> {
    return this.selectFieldsOfAssetsDetailsByRoomId(roomId).pipe(
      mergeMap(assets =>
        forkJoin(
          assets.map(asset => this.oispService.getAssetDetailsFieldsWithReplacedExternalIds(asset))
        )
      )
    );
  }

  joinFieldsOfSingleAssetWithOispData(asset: Asset): Observable<AssetWithFields> {
    return this.fieldQuery.selectFieldsOfAsset(asset.id).pipe(
      mergeMap(myFields => {
        const assetWithFields = Object.assign({ fields: myFields }, asset);
        return this.oispService.getAssetFieldsWithReplacedExternalIds(assetWithFields);
      })
    );
  }

}
