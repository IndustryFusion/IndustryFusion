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
import { BehaviorSubject, combineLatest, forkJoin, Observable, Subject } from 'rxjs';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { Asset, AssetWithFields } from 'src/app/store/asset/asset.model';
import { AssetQuery } from 'src/app/store/asset/asset.query';
import { AssetService } from 'src/app/store/asset/asset.service';
import { Company } from 'src/app/store/company/company.model';
import { CompanyQuery } from 'src/app/store/company/company.query';
import { CompanyService } from 'src/app/store/company/company.service';
import { FactoryComposedQuery } from 'src/app/store/composed/factory-composed.query';
import { FieldDetails } from 'src/app/store/field-details/field-details.model';
import { FieldDetailsQuery } from 'src/app/store/field-details/field-details.query';
import { FieldDetailsService } from 'src/app/store/field-details/field-details.service';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { FactorySiteQuery } from 'src/app/store/factory-site/factory-site.query';
import { FactorySiteService } from 'src/app/store/factory-site/factory-site.service';
import { Room } from 'src/app/store/room/room.model';
import { RoomQuery } from 'src/app/store/room/room.query';
import { RoomService } from 'src/app/store/room/room.service';
import { FactoryAssetDetailsWithFields } from '../../store/factory-asset-details/factory-asset-details.model';
import { FactoryAssetDetailsQuery } from '../../store/factory-asset-details/factory-asset-details.query';
import { FactoryAssetDetailsService } from '../../store/factory-asset-details/factory-asset-details.service';
import { AssetSeriesDetails } from '../../store/asset-series-details/asset-series-details.model';
import { AssetSeriesDetailsQuery } from '../../store/asset-series-details/asset-series-details.query';
import { CountryResolver } from '../../resolvers/country.resolver';
import { ID } from '@datorama/akita';
import { RouteHelpers } from '../../common/utils/route-helpers';

@Injectable({
  providedIn: 'root'
})
export class FactoryResolver {
  public company$: Observable<Company>;
  public factorySites$: Observable<FactorySite[]>;
  public factorySite$: Observable<FactorySite>;
  public rooms$: Observable<Room[]>;
  public roomsOfFactorySite$: Observable<Room[]>;
  public room$: Observable<Room>;
  public assetSeries$: Observable<AssetSeriesDetails[]>;
  public assets$: Observable<Asset[]>;
  public assetsWithDetailsAndFields$: Observable<FactoryAssetDetailsWithFields[]>;
  public assetsWithDetailsAndFieldsAndValues$: Observable<FactoryAssetDetailsWithFields[]>;
  public assetsWithFields$: Observable<AssetWithFields[]>;
  public asset$: Observable<Asset>;
  public assetWithFields$: Observable<AssetWithFields>;
  public assetWithDetailsAndFields$: Observable<FactoryAssetDetailsWithFields>;
  public assetWithDetailsAndFieldsAndValues$: Observable<FactoryAssetDetailsWithFields>;
  public fields$: Observable<FieldDetails[]>;
  public factorySubTitle$: Subject<string>;
  public companies$: Observable<Company[]>;

  constructor(
    private companyService: CompanyService,
    private companyQuery: CompanyQuery,
    private factorySiteService: FactorySiteService,
    private factorySiteQuery: FactorySiteQuery,
    private roomService: RoomService,
    private roomQuery: RoomQuery,
    private assetSeriesDetailsQuery: AssetSeriesDetailsQuery,
    private assetService: AssetService,
    private assetQuery: AssetQuery,
    private assetDetailsService: FactoryAssetDetailsService,
    private assetDetailsQuery: FactoryAssetDetailsQuery,
    private fieldService: FieldDetailsService,
    private fieldDetailsQuery: FieldDetailsQuery,
    private factoryComposedQuery: FactoryComposedQuery,
    private countryResolver: CountryResolver) {

    this.company$ = this.companyQuery.selectActive();
    this.factorySite$ = this.factorySiteQuery.selectActive();
    this.room$ = this.roomQuery.selectActive();
    this.asset$ = this.assetQuery.selectActive();
    this.factorySubTitle$ = new BehaviorSubject('Launchpad');
  }

  resolve(activatedRoute: ActivatedRoute): void {
    this.countryResolver.resolve().subscribe();
    const companyId = this.resolveCompany(activatedRoute);
    const factorySiteId = this.resolveFactorySite(activatedRoute, companyId);
    this.resolveRoom(activatedRoute, factorySiteId);
    this.resolveAsset(activatedRoute, companyId);
  }

  private resolveCompany(activatedRoute: ActivatedRoute): ID {
    this.companies$ = this.companyService.getCompanies();
    this.companyService.getCompanies().subscribe();
    let companyId = RouteHelpers.findParamInFullActivatedRoute(activatedRoute.snapshot, 'companyId');
    if (companyId == null && this.companyQuery.getActiveId() != null) {
      companyId = this.companyQuery.getActiveId();
    }

    this.companyService.setActive(companyId);
    if (companyId != null) {
      this.companyService.getCompany(companyId).subscribe();
      this.factorySiteService.getFactorySites(companyId).subscribe();
      this.roomService.getRoomsOfCompany(companyId).subscribe();
      this.assetService.getAssetsOfCompany(companyId).subscribe();
      this.assetDetailsService.getAssetDetailsOfCompany(companyId).subscribe();

      this.assetSeries$ = this.assetSeriesDetailsQuery.selectAll();
      this.factorySites$ = this.factorySiteQuery.selectFactorySitesOfCompanyInFactoryManager(companyId);
      this.rooms$ = this.roomQuery.selectRoomsOfCompany();
      this.assets$ = this.assetQuery.selectAssetsOfCompany(companyId);
      this.assetDetailsQuery.selectAssetDetailsOfCompany(companyId).pipe(
        switchMap(assetDetailsArray =>
          forkJoin(
            assetDetailsArray.map(assetDetails => this.fieldService.getFieldsOfAsset(companyId, assetDetails.id))))
      ).subscribe();
      this.assetsWithDetailsAndFields$ = this.factoryComposedQuery.joinAssetsDetailsWithFieldInstancesWithAlerts();
      this.assetsWithDetailsAndFieldsAndValues$ = this.assetsWithDetailsAndFields$.pipe(
        mergeMap((assets) =>
          combineLatest(
            assets.map((asset) => {
              return this.assetService.updateAssetWithFieldValues(asset);
            })
          )
        ),
      );
    }

    return companyId;
  }

  private resolveFactorySite(activatedRoute: ActivatedRoute, companyId: ID): ID {
    const factorySiteId = RouteHelpers.findParamInFullActivatedRoute(activatedRoute.snapshot, 'factorySiteId');
    this.factorySiteService.setActive(factorySiteId);
    if (factorySiteId != null) {
      this.factorySites$ = this.factorySiteQuery.selectFactorySitesOfCompanyInFactoryManager(companyId);
      this.rooms$ = this.roomQuery.selectRoomsOfCompany(); // TODO: shouldn't this be selectRoomsOfFactorySite(factorySiteId)?
      this.roomsOfFactorySite$ = this.roomQuery.selectRoomsOfFactorySite(factorySiteId);
      this.assetSeries$ = this.assetSeriesDetailsQuery.selectAll();
      this.assets$ = this.factoryComposedQuery.selectAssetsOfFactorySite(factorySiteId);
      this.assetsWithDetailsAndFields$ = this.factoryComposedQuery.selectFieldsOfAssetsDetailsByFactorySiteId(factorySiteId);
    }
    return factorySiteId;
  }

  private resolveRoom(activatedRoute: ActivatedRoute, factorySiteId: ID) {
    const roomId =  RouteHelpers.findParamInFullActivatedRoute(activatedRoute.snapshot, 'roomId');
    this.roomService.setActive(roomId);
    if (roomId != null) {
      this.rooms$ = this.roomQuery.selectActive().pipe(map(room => Array(room)));
      this.roomsOfFactorySite$ = this.roomQuery.selectRoomsOfFactorySite(factorySiteId);
      this.assets$ = this.assetQuery.selectAssetsOfRoom(roomId);
      this.assetsWithDetailsAndFields$ = this.factoryComposedQuery.selectFieldsOfAssetsDetailsByRoomId(roomId);
    }
  }

  private resolveAsset(activatedRoute: ActivatedRoute, companyId: ID) {
    const assetId =  RouteHelpers.findParamInFullActivatedRoute(activatedRoute.snapshot, 'assetId');
    this.assetService.setActive(assetId);
    this.assetDetailsService.setActive(assetId);
    if (assetId != null) {
      this.fieldService.getFieldsOfAsset(companyId, assetId).subscribe();
      this.assetQuery.setSelectedAssetIds([assetId]);
      this.fields$ = this.fieldDetailsQuery.selectFieldsOfAsset(assetId);
      this.assetWithFields$ = this.assetQuery.waitForActive().pipe(mergeMap((asset) => {
        return this.factoryComposedQuery.joinAssetAndFieldInstanceDetails(asset);
      }));
      this.assetWithDetailsAndFields$ = this.factoryComposedQuery.selectFieldsOfAssetsDetailsOfActiveAsset();
      this.assetWithDetailsAndFieldsAndValues$ = this.assetWithDetailsAndFields$.pipe(
        mergeMap((asset) => this.assetService.updateAssetWithFieldValues(asset))
      );
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
      this.assetsWithFields$ = this.factoryComposedQuery.selectFieldsOfSelectedAssets();
    }
  }
}
