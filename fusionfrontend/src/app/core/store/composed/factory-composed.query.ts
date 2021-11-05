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
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OispService } from '../../services/api/oisp.service';
import {
  FactoryAssetDetails,
  FactoryAssetDetailsWithFields
} from '../factory-asset-details/factory-asset-details.model';
import { FactoryAssetDetailsQuery } from '../factory-asset-details/factory-asset-details.query';
import { Asset, AssetWithFields } from '../asset/asset.model';
import { AssetQuery } from '../asset/asset.query';
import { FieldDetailsQuery } from '../field-details/field-details.query';
import { FactorySiteWithAssetCount } from '../factory-site/factory-site.model';
import { FactorySiteQuery } from '../factory-site/factory-site.query';
import { Room } from '../room/room.model';
import { RoomQuery } from '../room/room.query';
import { OispAlertQuery } from '../oisp/oisp-alert/oisp-alert.query';

@Injectable({ providedIn: 'root' })
export class FactoryComposedQuery {
  constructor(
    protected factorySiteQuery: FactorySiteQuery,
    protected roomQuery: RoomQuery,
    protected assetQuery: AssetQuery,
    protected factoryAssetDetailsQuery: FactoryAssetDetailsQuery,
    protected fieldDetailsQuery: FieldDetailsQuery,
    protected oispAlertQuery: OispAlertQuery,
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
      this.fieldDetailsQuery.selectAll()
    ]).pipe(
      map(([assets, fields]) =>
        assets.map(asset => {
          const filteredFields = fields.filter(field => field.assetId === asset.id);
          return Object.assign({ fields: filteredFields }, asset);
        })
      )
    );
  }

  selectAssetsWithFieldInstanceDetails(): Observable<FactoryAssetDetailsWithFields[]> {
    return combineQueries([
      this.factoryAssetDetailsQuery.selectAll(),
      this.fieldDetailsQuery.selectAll()
    ]).pipe(
      map(([assetsDetails, fields]) =>
        assetsDetails.map(assetDetails => {
          const filteredFields = fields.filter(field => field.assetId === assetDetails.id);
          return Object.assign({ fields: filteredFields }, assetDetails);
        })
      )
    );
  }

  /**
   * @description Do not forget to unsubscribe when component is destroyed.
   */
  selectActiveAssetWithFieldInstanceDetails(): Observable<FactoryAssetDetailsWithFields> {
    return combineQueries([
      // Wait here for multiple actives (not the first as elsewhere) to get asset detail info updated when a subsystem is selected
      this.factoryAssetDetailsQuery.waitForActives(),
      this.fieldDetailsQuery.selectAll()
    ]).pipe(
      map(([activeAsset, fieldDetails]) => {
        const filteredFields = fieldDetails.filter(field => field.assetId === activeAsset.id);
        return Object.assign({ fields: filteredFields}, activeAsset);
      })
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
      this.fieldDetailsQuery.selectAll()
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
      this.fieldDetailsQuery.selectAll()
    ]).pipe(
      map(([assetsDetails, fields]) =>
        assetsDetails.map(assetDetails => {
          const filteredFields = fields.filter(field => field.assetId === assetDetails.id);
          return Object.assign({ fields: filteredFields }, assetDetails);
        })
      )
    );
  }

  selectFieldsOfAssetsDetailsOfActiveAsset(): Observable<FactoryAssetDetailsWithFields> {
    return combineQueries([
      this.factoryAssetDetailsQuery.waitForActive(),
      this.fieldDetailsQuery.selectAll()
    ]).pipe(
      map(([assetDetails, fields]) => {
        const filteredFields = fields.filter(field => field.assetId === assetDetails.id);
        return Object.assign({ fields: filteredFields }, assetDetails);
      })
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

  joinAssetAndFieldInstanceDetails(asset: Asset): Observable<AssetWithFields> {
    return this.fieldDetailsQuery.selectFieldsOfAsset(asset.id).pipe(
      map(fieldDetails => {
        const assetWithFieldDetails: AssetWithFields = Object.assign({ fields: fieldDetails }, asset);
        return assetWithFieldDetails;
      })
    );
  }

  joinAssetsDetailsWithFieldInstancesWithAlerts(): Observable<FactoryAssetDetailsWithFields[]> {
    return this.selectAssetsWithFieldInstanceDetails().pipe(
      map((assetsDetails: FactoryAssetDetailsWithFields[]) => {
        return assetsDetails.map(asset => this.oispAlertQuery.joinAssetDetailsWithOpenAlertPriority(asset));
      })
    );
  }
}
