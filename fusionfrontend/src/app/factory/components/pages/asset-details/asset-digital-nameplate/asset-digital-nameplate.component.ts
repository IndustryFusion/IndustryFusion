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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Status } from 'src/app/factory/models/status.model';
import { PointWithId } from 'src/app/services/oisp.model';
import { OispService } from 'src/app/services/oisp.service';
import { StatusService } from 'src/app/services/status.service';
import { FieldDetails } from 'src/app/store/field-details/field-details.model';
import { OispDeviceQuery } from '../../../../../store/oisp/oisp-device/oisp-device.query';
import { ID } from '@datorama/akita';
import { FactoryAssetDetailsWithFields } from '../../../../../store/factory-asset-details/factory-asset-details.model';
import { FactoryResolver } from '../../../../services/factory-resolver.service';
import { FactoryAssetDetailsQuery } from '../../../../../store/factory-asset-details/factory-asset-details.query';
import { faLayerGroup, faPlayCircle } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-asset-digital-nameplate',
  templateUrl: './asset-digital-nameplate.component.html',
  styleUrls: ['./asset-digital-nameplate.component.scss']
})

export class AssetDigitalNameplateComponent implements OnInit, OnDestroy {
  assetId: ID;
  asset$: Observable<FactoryAssetDetailsWithFields>;

  latestPoints$: Observable<PointWithId[]>;
  mergedFields$: Observable<FieldDetails[]>;
  status$: Observable<Status>;

  manualIcon = faLayerGroup;
  videoIcon = faPlayCircle;

  constructor(
    private oispService: OispService,
    private oispDeviceQuery: OispDeviceQuery,
    private statusService: StatusService,
    private factoryResolver: FactoryResolver,
    private activatedRoute: ActivatedRoute,
    private factoryAssetQuery: FactoryAssetDetailsQuery) {
  }

  ngOnInit() {
    this.factoryResolver.resolve(this.activatedRoute);
    this.assetId = this.factoryAssetQuery.getActiveId();
    this.asset$ = this.factoryResolver.assetWithDetailsAndFields$;

    this.latestPoints$ = combineLatest([this.asset$, timer(0, 2000)]).pipe(
      switchMap(([asset, _]) => {
        return this.oispService.getLastValueOfAllFields(asset, asset?.fields, 5);
      })
    );

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
        }));


    this.status$ = combineLatest([this.asset$, this.mergedFields$]).pipe(
      map(([asset, fields]) => {
        return this.statusService.determineStatus(fields, asset);
      })
    );
  }

  ngOnDestroy() {
  }

  openExternalUrl(url: string) {
    window.open(url, '_blank');
  }
}