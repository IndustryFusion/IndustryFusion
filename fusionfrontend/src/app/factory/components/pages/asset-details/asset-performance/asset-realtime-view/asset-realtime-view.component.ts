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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable, Subject, zip } from 'rxjs';
import { OispService } from 'src/app/services/oisp.service';
import { PointWithId } from 'src/app/services/oisp.model';
import { FieldDetails } from 'src/app/store/field-details/field-details.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetQuery } from 'src/app/store/asset/asset.query';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { MaintenanceInterval } from '../../../../content/asset-details/maintenance-bar/maintenance-interval.model';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { ID } from '@datorama/akita';
import { OispDeviceQuery } from '../../../../../../store/oisp/oisp-device/oisp-device.query';
import { FactoryAssetDetailsResolver } from '../../../../../../resolvers/factory-asset-details.resolver';
import { FactoryAssetDetailsWithFields } from '../../../../../../store/factory-asset-details/factory-asset-details.model';
import { AssetMaintenanceUtils } from '../../../../../util/asset-maintenance-utils';
import { AssetPerformanceViewMode } from '../AssetPerformanceViewMode';
import { RouteHelpers } from '../../../../../../common/utils/route-helpers';

@Component({
  selector: 'app-asset-realtime-view',
  templateUrl: './asset-realtime-view.component.html',
  styleUrls: ['./asset-realtime-view.component.scss']
})
export class AssetRealtimeViewComponent implements OnInit, OnDestroy {

  @Input()
  viewModeOptions;

  viewMode: AssetPerformanceViewMode;
  isLoading$: Observable<boolean>;
  asset$: Observable<FactoryAssetDetailsWithFields>;
  assetId: ID;
  latestPoints$: Observable<PointWithId[]>;
  mergedFields$: Observable<FieldDetails[]>;
  hoursTillMaintenanceValue$: Observable<number>;
  maintenanceIntervalValue$: Observable<number>;
  maintenanceUtils = AssetMaintenanceUtils;
  maintenanceValues: MaintenanceInterval = {
    hoursTillMaintenance: null,
    maintenanceInterval: null
  };

  private unSubscribe$ = new Subject<void>();


  constructor(private assetQuery: AssetQuery,
              private oispService: OispService,
              private oispDeviceQuery: OispDeviceQuery,
              private factoryResolver: FactoryResolver,
              private factoryAssetDetailsResolver: FactoryAssetDetailsResolver,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.isLoading$ = this.assetQuery.selectLoading();
    this.factoryResolver.resolve(this.activatedRoute);
    this.factoryAssetDetailsResolver.resolve(this.activatedRoute.snapshot);
    this.assetId = this.assetQuery.getActiveId();
    this.asset$ = this.factoryResolver.assetWithDetailsAndFieldsAndValues$;

    this.initLastPoints();
    this.initMergedFields();
    this.initHoursTillMaintencanceValue();
    this.initMaintenanceIntervalValue();
    this.zipHoursTillValueAndMaintenanceIntervalValue();

    this.initViewMode();
  }

  private initLastPoints() {
    this.latestPoints$ = this.asset$
      .pipe(
        switchMap(asset => this.oispService.getLastValueOfAllFields(asset, asset.fields, 2))
      );
  }

  private initMergedFields() {
    this.mergedFields$ = combineLatest([this.asset$, this.latestPoints$])
      .pipe(
        map(([asset, latestPoints]) => {
          return asset.fields.map(field => {
            const fieldCopy = Object.assign({ }, field);
            const point = latestPoints.find(latestPoint => latestPoint.id ===
              this.oispDeviceQuery.mapExternalNameOFieldInstanceToComponentId(asset.externalName, field.externalName));

            if (point) {
              fieldCopy.value = point.value;
            }
            return fieldCopy;
          });
        })
      );
  }

  private initHoursTillMaintencanceValue() {
    this.hoursTillMaintenanceValue$ = this.mergedFields$.pipe(
      map(fields => {
        const filteredFields = fields.filter(field => field.description === 'Hours till maintenance');
        if (filteredFields.length > 0) {
          return parseInt(filteredFields.find(field => field.description === 'Hours till maintenance')?.value, 10);
        }
      })
    );
  }

  private initMaintenanceIntervalValue() {
    this.maintenanceIntervalValue$ = this.mergedFields$.pipe(
      map(fields => {
        const filteredFields = fields.filter(field => field.description === 'Maintenance interval');
        if (filteredFields.length > 0) {
          return parseInt(filteredFields.find(field => field.description === 'Maintenance interval')?.value, 10);
        }
      })
    );
  }

  private zipHoursTillValueAndMaintenanceIntervalValue() {
    zip(this.hoursTillMaintenanceValue$,
      this.maintenanceIntervalValue$
    )
      .pipe(
        takeUntil(this.unSubscribe$)
      ).subscribe(values => {
      this.maintenanceValues.hoursTillMaintenance = isNaN(values[0]) ? 0 : values[0];
      this.maintenanceValues.maintenanceInterval = isNaN(values[1]) ? 0 : values[1];
    });
  }

  private initViewMode() {
    this.viewMode = AssetPerformanceViewMode.REALTIME;
  }

  ngOnDestroy() {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  onChangeRoute(): Promise<boolean> {
    const newRoute = ['..', this.viewMode];
    return this.router.navigate(newRoute, { relativeTo: RouteHelpers.getActiveRouteLastChild(this.activatedRoute) });
  }
}
