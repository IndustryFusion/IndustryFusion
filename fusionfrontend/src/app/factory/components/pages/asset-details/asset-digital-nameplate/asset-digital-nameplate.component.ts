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
import { PointWithId } from 'src/app/core/services/api/oisp.model';
import { StatusService } from 'src/app/core/services/logic/status.service';
import { FieldDetails, FieldType } from 'src/app/core/store/field-details/field-details.model';
import { ID } from '@datorama/akita';
import { FactoryAssetDetailsWithFields } from '../../../../../core/store/factory-asset-details/factory-asset-details.model';
import { FactoryResolver } from '../../../../services/factory-resolver.service';
import { FactoryAssetDetailsQuery } from '../../../../../core/store/factory-asset-details/factory-asset-details.query';
import { faLayerGroup, faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';
import { FactoryAssetDetailsResolver } from '../../../../../core/resolvers/factory-asset-details.resolver';
import { FieldDataType } from '../../../../../core/store/field/field.model';
import {NgsiLdService} from "../../../../../core/services/api/ngsi-ld.service";


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
  fieldDataTypes = FieldDataType;

  constructor(
    private ngsiLdService: NgsiLdService,
    private statusService: StatusService,
    private factoryResolver: FactoryResolver,
    private activatedRoute: ActivatedRoute,
    private factoryAssetDetailsResolver: FactoryAssetDetailsResolver,
    private factoryAssetQuery: FactoryAssetDetailsQuery) {
  }

  ngOnInit() {
    this.factoryResolver.resolve(this.activatedRoute);
    this.factoryAssetDetailsResolver.resolve(this.activatedRoute.snapshot);
    this.assetId = this.factoryAssetQuery.getActiveId();
    this.asset$ = this.factoryResolver.assetWithDetailsAndFields$;

    // TODO: refactor using status.service.getStatusByAssetWithFields
    this.latestPoints$ = combineLatest([this.asset$, timer(0, environment.dataUpdateIntervalMs)]).pipe(
      switchMap(([asset, _]) => {
        return this.ngsiLdService.getLastValueOfAllFields(asset);
      })
    );

    this.mergedFields$ = combineLatest([this.asset$, this.latestPoints$])
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

  ngOnDestroy() {
  }

  openExternalUrl(url: string) {
    window.open(url, '_blank');
  }

  getAttributes(fields: FieldDetails[]): FieldDetails[] {
    return fields?.filter(field => field.fieldType === FieldType.ATTRIBUTE);
  }
}
