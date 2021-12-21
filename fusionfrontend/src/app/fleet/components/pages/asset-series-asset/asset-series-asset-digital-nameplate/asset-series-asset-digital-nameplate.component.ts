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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Status } from 'src/app/factory/models/status.model';
import { PointWithId } from 'src/app/core/services/api/oisp.model';
import { StatusService } from 'src/app/core/services/logic/status.service';
import { FieldDetails, FieldType } from 'src/app/core/store/field-details/field-details.model';
import { ID } from '@datorama/akita';
import { environment } from 'src/environments/environment';
import { FactorySite, FactorySiteType } from '../../../../../core/store/factory-site/factory-site.model';
import { Company } from '../../../../../core/store/company/company.model';
import { CompanyQuery } from '../../../../../core/store/company/company.query';
import { FactorySiteQuery } from '../../../../../core/store/factory-site/factory-site.query';
import { RouteHelpers } from '../../../../../core/helpers/route-helpers';
import { AssetSeriesDetailsService } from '../../../../../core/store/asset-series-details/asset-series-details.service';
import { FieldDataType } from '../../../../../core/store/field/field.model';
import { FleetAssetDetailsWithFields } from '../../../../../core/store/fleet-asset-details/fleet-asset-details.model';
import { FleetComposedQuery } from '../../../../../core/store/composed/fleet-composed.query';
import { FleetAssetDetailsQuery } from '../../../../../core/store/fleet-asset-details/fleet-asset-details.query';
import { Room } from '../../../../../core/store/room/room.model';
import { RoomQuery } from '../../../../../core/store/room/room.query';
import { FieldInstanceDetailsResolver } from '../../../../../core/resolvers/field-instance-details.resolver';
import { AssetService } from '../../../../../core/store/asset/asset.service';
import {NgsiLdService} from "../../../../../core/services/api/ngsi-ld.service";


@Component({
  selector: 'app-asset-series-asset-digital-nameplate',
  templateUrl: './asset-series-asset-digital-nameplate.component.html',
  styleUrls: ['./asset-series-asset-digital-nameplate.component.scss']
})
export class AssetSeriesAssetDigitalNameplateComponent implements OnInit {

  assetId: ID;
  assetWithFields$: Observable<FleetAssetDetailsWithFields>;

  latestPoints$: Observable<PointWithId[]>;
  mergedFields$: Observable<FieldDetails[]>;
  status$: Observable<Status>;

  factorySite$: Observable<FactorySite>;
  company$: Observable<Company>;

  factorySiteTypes = FactorySiteType;
  fieldDataTypes = FieldDataType;

  private rooms$: Observable<Room[]>;

  constructor(
    private ngsiLdService: NgsiLdService,
    private statusService: StatusService,
    private activatedRoute: ActivatedRoute,
    private assetService: AssetService,
    private fleetAssetDetailsQuery: FleetAssetDetailsQuery,
    private fieldInstanceDetailsResolver: FieldInstanceDetailsResolver,
    private companyQuery: CompanyQuery,
    private roomQuery: RoomQuery,
    private factorySiteQuery: FactorySiteQuery,
    private assetSeriesDetailsService: AssetSeriesDetailsService,
    public assetService: AssetService
    private fleetComposedQuery: FleetComposedQuery,
  ) {
  }

  ngOnInit() {
    this.resolve();

    this.factorySite$ = this.initFactorySite();
    this.company$ = this.factorySite$.pipe(switchMap(site => this.companyQuery.selectEntity(site?.companyId)));

    this.latestPoints$ = this.initLatestPoints();
    this.mergedFields$ = this.initMergedFields();

    this.status$ = this.mergedFields$.pipe(
      map(fields => this.statusService.determineStatus(fields))
    );
  }

  private resolve() {
    this.assetId = this.fleetAssetDetailsQuery.getActiveId();
    this.assetService.setActive(this.assetId);

    this.fieldInstanceDetailsResolver.resolve();
    this.assetWithFields$ = this.fleetComposedQuery.selectFieldsOfAssetsDetailsOfActivesAsset();
    this.assetWithFields$.subscribe(asset => this.assetSeriesId = asset.assetSeriesId);


    const assetSeriesId = RouteHelpers.findParamInFullActivatedRoute(this.activatedRoute.snapshot, 'assetSeriesId');
    if (assetSeriesId != null) {
      this.assetSeriesDetailsService.setActive(assetSeriesId);
    }
  }

  private initFactorySite() {
    this.rooms$ = this.roomQuery.selectRoomsOfCompany();

    return combineLatest([this.assetWithFields$, this.rooms$]).pipe(
      switchMap(([asset, rooms]) => {
        const assetRoom = rooms.find((room) => room.id === asset.roomId);
        return this.factorySiteQuery.selectAll().pipe(
          map(sites => sites.find(site => site.id === assetRoom?.factorySiteId))
        );
      })
    );
  }

    this.company$ = this.factorySite$.pipe(switchMap(site => this.companyQuery.selectEntity(site?.companyId)));

  private initLatestPoints() {
    // TODO: refactor using status.service.getStatusByAssetWithFields
    return combineLatest([this.assetWithFields$, timer(0, environment.dataUpdateIntervalMs)]).pipe(
      switchMap(([asset, _]) => {
        return this.ngsiLdService.getLastValueOfAllFields(asset);
      })
    );
  }

  private initMergedFields() {
    return combineLatest([this.assetWithFields$, this.latestPoints$])
      .pipe(
        map(([asset, latestPoints]) => {
          return asset.fields.map(field => {
            const fieldCopy = Object.assign({ }, field);
            const point = latestPoints[field.externalName];

            if (point) {
              fieldCopy.value = point;
            }
            return fieldCopy;
          });
        }));


    this.status$ = this.mergedFields$.pipe(
      map(fields => this.statusService.determineStatus(fields))
    );
  }

  getAttributes(fields: FieldDetails[]): FieldDetails[] {
    return fields?.filter(field => field.fieldType === FieldType.ATTRIBUTE);
  }
}
