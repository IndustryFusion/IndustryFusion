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
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, forkJoin, Observable, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
// import { switchMap } from 'rxjs/operators';
import { Asset, AssetWithFields } from 'src/app/store/asset/asset.model';
import { AssetQuery } from 'src/app/store/asset/asset.query';
import { AssetService } from 'src/app/store/asset/asset.service';
import { Company } from 'src/app/store/company/company.model';
import { CompanyQuery } from 'src/app/store/company/company.query';
import { CompanyService } from 'src/app/store/company/company.service';
import { FactoryComposedQuery } from 'src/app/store/composed/factory-composed.query';
import { Field } from 'src/app/store/field/field.model';
import { FieldQuery } from 'src/app/store/field/field.query';
import { FieldService } from 'src/app/store/field/field.service';
import { Location } from 'src/app/store/location/location.model';
import { LocationQuery } from 'src/app/store/location/location.query';
import { LocationService } from 'src/app/store/location/location.service';
import { Room } from 'src/app/store/room/room.model';
import { RoomQuery } from 'src/app/store/room/room.query';
import { RoomService } from 'src/app/store/room/room.service';
import { AssetDetailsWithFields } from '../../store/asset-details/asset-details.model';
import { AssetDetailsQuery } from '../../store/asset-details/asset-details.query';
import { AssetDetailsService } from '../../store/asset-details/asset-details.service';
import { FactoryManagerPageType, RouteData } from '../factory-routing.model';
import { AssetSeriesDetails } from '../../store/asset-series-details/asset-series-details.model';
import { AssetSeriesDetailsQuery } from '../../store/asset-series-details/asset-series-details-query.service';

@Injectable({
  providedIn: 'root'
})
export class FactoryResolver {
  public company$: Observable<Company>;
  public locations$: Observable<Location[]>;
  public location$: Observable<Location>;
  public rooms$: Observable<Room[]>;
  public allRoomsOfLocation$: Observable<Room[]>;
  public room$: Observable<Room>;
  public assetSeries$: Observable<AssetSeriesDetails[]>;
  public assets$: Observable<Asset[]>;
  public assetsWithDetailsAndFields$: Observable<AssetDetailsWithFields[]>;
  public assetsWithFields$: Observable<AssetWithFields[]>;
  public asset$: Observable<Asset>;
  public assetWithFields$: Observable<AssetWithFields>;
  public fields$: Observable<Field[]>;
  public factorySubTitle$: Subject<string>;

  constructor(
    private companyService: CompanyService,
    private companyQuery: CompanyQuery,
    private locationService: LocationService,
    private locationQuery: LocationQuery,
    private roomService: RoomService,
    private roomQuery: RoomQuery,
    private assetSeriesDetailsQuery: AssetSeriesDetailsQuery,
    private assetService: AssetService,
    private assetQuery: AssetQuery,
    private assetDetailsService: AssetDetailsService,
    private assetDetailsQuery: AssetDetailsQuery,
    private fieldService: FieldService,
    private fieldQuery: FieldQuery,
    private factoryComposedQuery: FactoryComposedQuery) {

    this.company$ = this.companyQuery.selectActive();
    this.location$ = this.locationQuery.selectActive();
    this.room$ = this.roomQuery.selectActive();
    this.asset$ = this.assetQuery.selectActive();
    this.factorySubTitle$ = new BehaviorSubject('Apps');
  }

  resolve(activatedRoute: ActivatedRoute): void {
    const companyId = activatedRoute.snapshot.paramMap.get('companyId');
    this.companyService.setActive(companyId);
    if (companyId != null) {
      this.companyService.getCompany(companyId).subscribe();
      this.locationService.getLocations(companyId).subscribe();
      this.roomService.getRoomsOfCompany(companyId).subscribe();
      this.assetService.getAssetsOfCompany(companyId).subscribe();
      this.assetDetailsService.getAssetDetailsOfCompany(companyId).subscribe();

      this.assetSeries$ = this.assetSeriesDetailsQuery.selectAll();
      this.locations$ = this.locationQuery.selectLocationsOfCompany(companyId);
      this.rooms$ = this.roomQuery.selectAllRooms();
      this.assets$ = this.assetQuery.selectAssetsOfCompany(companyId);
      this.assetDetailsQuery.selectAssetDetailsOfCompany(companyId).pipe(
        switchMap(assetDetailsArray =>
          forkJoin(
            assetDetailsArray.map(assetDetails => this.fieldService.getFieldsOfAsset(companyId, assetDetails.id))))
      ).subscribe();
      this.assetsWithDetailsAndFields$ = this.factoryComposedQuery.joinFieldsOfAssetsDetailsWithOispData();
    }
    const locationId = activatedRoute.snapshot.paramMap.get('locationId');
    this.locationService.setActive(locationId);
    if (locationId != null) {
      this.locations$ = this.locationQuery.selectLocationsOfCompany(companyId);
      this.rooms$ = this.roomQuery.selectAllRooms();
      this.allRoomsOfLocation$ = this.roomQuery.selectRoomsOfLocation(locationId);
      this.assetSeries$ = this.assetSeriesDetailsQuery.selectAll();
      this.assets$ = this.factoryComposedQuery.selectAssetsOfLocation(locationId);
      this.assetsWithDetailsAndFields$ = this.factoryComposedQuery.selectAssetDetailsWithFieldsOfLocationAndJoinWithOispData(locationId);
    }
    const roomId = activatedRoute.snapshot.paramMap.get('roomId');
    this.roomService.setActive(roomId);
    if (roomId != null) {
      this.rooms$ = this.roomQuery.selectActive().pipe(map(room => Array(room)));
      this.allRoomsOfLocation$ = this.roomQuery.selectRoomsOfLocation(locationId);
      this.assets$ = this.assetQuery.selectAssetsOfRoom(roomId);
      this.assetsWithDetailsAndFields$ = this.factoryComposedQuery.selectAssetDetailsWithFieldsOfRoomAndJoinWithOispData(roomId);
    }
    const assetId = activatedRoute.snapshot.paramMap.get('assetId');
    this.assetService.setActive(assetId);
    if (assetId != null) {
      this.fieldService.getFieldsOfAsset(companyId, assetId).subscribe();
      this.assetQuery.setSelectedAssetIds([assetId]);
      this.fields$ = this.fieldQuery.selectFieldsOfAsset(assetId);
      this.assetWithFields$ = this.factoryComposedQuery.joinFieldsOfSingleAssetWithOispData(this.assetQuery.getActive());
    }
    const assetIdListParam = activatedRoute.snapshot.paramMap.get('assetIdList');
    if (assetIdListParam) {
      this.assetQuery.setSelectedAssetIds(assetIdListParam.split(',').map(entry => entry.trim()));
    }
    if (!assetId && !assetIdListParam) {
      this.assetQuery.setSelectedAssetIds([]);
    }
    if (this.assetQuery.getSelectedAssetIds().length > 0) {
      this.assetQuery.getSelectedAssets().pipe(
        switchMap(assets =>
          forkJoin(
            assets.map(asset => this.fieldService.getFieldsOfAsset(companyId, asset.id))))
      ).subscribe();
      this.assetsWithFields$ = this.factoryComposedQuery.joinFieldsOfAssetsWithOispData();
    }

    const pageTypes: FactoryManagerPageType[] = (activatedRoute.snapshot.data as RouteData).pageTypes || [];
    if (pageTypes.includes(FactoryManagerPageType.COMPANY_DETAIL)) {
      this.factorySubTitle$.next('My Factories');
    } else if (pageTypes.includes(FactoryManagerPageType.ASSET_DETAIL)) {
      this.assetQuery
        .waitForActive()
        .subscribe(asset => this.factorySubTitle$.next('Assets > ' + asset.name));
    } else if (
      pageTypes.includes(FactoryManagerPageType.LOCATION_DETAIL)
      && pageTypes.includes(FactoryManagerPageType.ROOM_DETAIL)
      && pageTypes.includes(FactoryManagerPageType.ASSET_LIST)) {
      this.roomQuery
        .waitForActive()
        .subscribe(room => this.factorySubTitle$.next('Rooms > ' + room.name));
    } else if (pageTypes.includes(FactoryManagerPageType.LOCATION_DETAIL) && pageTypes.includes(FactoryManagerPageType.ASSET_LIST)) {
      this.locationQuery
        .waitForActive()
        .subscribe(location => this.factorySubTitle$.next('Assets > ' + location.name));
    } else if (pageTypes.includes(FactoryManagerPageType.LOCATION_DETAIL) && pageTypes.includes(FactoryManagerPageType.ROOM_LIST)) {
      this.locationQuery
        .waitForActive()
        .subscribe(location => this.factorySubTitle$.next('Rooms > ' + location.name));
    } else if (pageTypes.includes(FactoryManagerPageType.ROOM_DETAIL)) {
      this.roomQuery
        .waitForActive()
        .subscribe(room => this.factorySubTitle$.next('Rooms > ' + room.name));
    } else if (pageTypes.includes(FactoryManagerPageType.ASSET_LIST)) {
      this.factorySubTitle$.next('My Assets');
    } else {
      this.factorySubTitle$.next('Apps');
    }
  }
}
