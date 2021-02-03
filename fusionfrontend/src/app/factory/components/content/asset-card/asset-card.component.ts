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
import { Field } from 'src/app/store/field/field.model';
import { LocationQuery } from 'src/app/store/location/location.query';

@Component({
  selector: 'app-asset-card',
  templateUrl: './asset-card.component.html',
  styleUrls: ['./asset-card.component.scss']
})

export class AssetCardComponent implements OnInit, OnDestroy {
  maxProgress = 1500;

  @Input()
  asset: AssetWithFields;

  latestPoints$: Observable<PointWithId[]>;
  mergedFields$: Observable<Field[]>;
  status$: Observable<Status>;
  progress$: Observable<number>;
  progressColor$: Observable<string>;

  showStatusCircle = true;

  constructor(
    private companyQuery: CompanyQuery,
    private locationQuery: LocationQuery,
    private oispService: OispService,
    private statusService: StatusService,
    private router: Router) { }

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
          const point = latestPoints.find(latestPoint => latestPoint.id === field.externalId);

          if (point) {
            fieldCopy.value = point.value;
          }
          return fieldCopy;
        });
      })
    )

    this.status$ = this.mergedFields$.pipe(
      map((fields) => {
        return this.statusService.determineStatus(fields, this.asset);
      })
    );

    /* TODO: Progress bar should be integrated later
    this.progress$ = combineLatest([this.fields$, this.mergedFields$])
      .pipe(
        map(([fields, mergedFields]) => {
          const filteredField = fields.filter(field => field.description === 'Hours till maintenance')[0];
          const filteredMergedField = mergedFields.filter(field => field.description === 'Hours till maintenance')[0];
          // no field hours till maintenance
          if (!filteredField) {
            return -1;
          }
          const progress = parseInt(filteredMergedField.value, 10);
          // no value retrieved for current time -> get last emitted value from oisp
          if (isNaN(progress)) {
            this.oispService.getLastValuesOfSingleField(this.asset, filteredField, 100000).pipe(
              map(points => {
                const val = points[points.length - 1].value;
                const lastProgress = parseInt(val, 10);
                if (isNaN(lastProgress)) {
                  return -2;
                } else {
                  return lastProgress;
                }
              })
            );
          } else {
            return progress;
          }
        })
      );

    this.progressColor$ = this.progress$.pipe(
      map(progress => {
        const ratio = progress / this.maxProgress;
        if (ratio < 0.33) {
          return '#C42326';
        } else if (ratio < 0.66) {
          return '#2CA9CE';
        } else {
          return 'rgba(44,206,79,0.73)';
        }
      })
    );*/
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
    const locationId = this.locationQuery.getActiveId();
    const roomId = this.asset.roomId;
    const assetId = this.asset.id;
    this.router.navigateByUrl(
      `factorymanager/companies/${companyId}/locations/${locationId}/rooms/${roomId}/assets/${assetId}/asset-details`
    );
  }

}
