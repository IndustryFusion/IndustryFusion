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
import { Router } from '@angular/router';
import { Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Status } from 'src/app/factory/models/status.model';
import { PointWithId } from 'src/app/services/oisp.model';
import { OispService } from 'src/app/services/oisp.service';
import { StatusService } from 'src/app/services/status.service';
import { AssetWithFields } from 'src/app/store/asset/asset.model';
import { CompanyQuery } from 'src/app/store/company/company.query';
import { FieldDetails } from 'src/app/store/field-details/field-details.model';
import { OispDeviceQuery } from '../../../../../store/oisp/oisp-device/oisp-device.query';

@Component({
  selector: 'app-asset-digital-nameplate',
  templateUrl: './asset-digital-nameplate.component.html',
  styleUrls: ['./asset-digital-nameplate.component.scss']
})

export class AssetDigitalNameplateComponent implements OnInit, OnDestroy {
  maxProgress = 1500;

  @Input()
  asset: AssetWithFields;

  latestPoints$: Observable<PointWithId[]>;
  mergedFields$: Observable<FieldDetails[]>;
  status$: Observable<Status>;

  constructor(
    private companyQuery: CompanyQuery,
    private oispService: OispService,
    private oispDeviceQuery: OispDeviceQuery,
    private statusService: StatusService,
    private router: Router) {
  }

  ngOnInit() {
    this.latestPoints$ = timer(0, 2000).pipe(
      switchMap(() => {
        return this.oispService.getLastValueOfAllFields(this.asset, this.asset.fields, 5);
      })
    );

    this.mergedFields$ = this.latestPoints$.pipe(
      map(latestPoints => {
        return this.asset.fields.map(field => {
          const fieldCopy = Object.assign({ }, field);
          const point = latestPoints.find(latestPoint => latestPoint.id ===
            this.oispDeviceQuery.mapExternalNameOFieldInstanceToComponentId(this.asset.externalName, field.externalName));

          if (point) {
            fieldCopy.value = point.value;
          }
          return fieldCopy;
        });
      })
    );

    this.status$ = this.mergedFields$.pipe(
      map((fields) => {
        return this.statusService.determineStatus(fields, this.asset);
      })
    );
  }

  ngOnDestroy() {
  }

  calculateMin(progress: number): number {
    return Math.min(progress / this.maxProgress * 100, 7);
  }

  formatValue(value: any, unit: any) {
    if (unit === 'bar' || unit === 'l/min') {
      return (Math.round(value * 10000) / 10000).toFixed(4);

    } else {
      return value;
    }
  }

  goToDetails() {
    const companyId = this.companyQuery.getActiveId();
    const assetId = this.asset.id;
    this.router.navigateByUrl(`factorymanager/companies/${companyId}/assets/${assetId}/digital-nameplate`);
  }

}
