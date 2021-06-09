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


import { Component, Input, OnInit } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PointWithId } from 'src/app/services/oisp.model';
import { OispService } from 'src/app/services/oisp.service';
import { StatusService } from 'src/app/services/status.service';
import { FieldDetails } from '../../../../store/field-details/field-details.model';
import { Status } from '../../../models/status.model';
import { AssetDetailsWithFields } from '../../../../store/asset-details/asset-details.model';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {

  @Input()
  asset: AssetDetailsWithFields;

  @Input()
  showStatusCircle;

  status$: Observable<Status>;
  latestPoints$: Observable<PointWithId[]>;
  mergedFields$: Observable<FieldDetails[]>;

  constructor(
    private oispService: OispService,
    private statusService: StatusService) {
  }

  ngOnInit(): void {
    this.latestPoints$ = timer(0, 2000).pipe(
      switchMap(() => {
        return this.oispService.getLastValueOfAllFields(this.asset, this.asset.fields, 5);
      })
    );

    this.mergedFields$ = this.latestPoints$
      .pipe(
        map(latestPoints => {
          return this.asset.fields.map(field => {
            const fieldCopy = Object.assign({ }, field);
            const point = latestPoints.find(latestPoint => latestPoint.id === field.externalId);

            if (point) {
              fieldCopy.value = point.value;
            }
            return fieldCopy;
          });
        }));

    this.status$ = this.mergedFields$.pipe(
      map((fields) => {
        return this.statusService.determineStatus(fields, this.asset);
      })
    );
  }
}
