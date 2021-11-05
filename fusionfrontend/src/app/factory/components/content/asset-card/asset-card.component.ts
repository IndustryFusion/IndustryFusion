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

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Status } from 'src/app/factory/models/status.model';
import { OispService } from 'src/app/core/services/api/oisp.service';
import { StatusService } from 'src/app/core/services/logic/status.service';
import { AssetWithFields } from 'src/app/core/store/asset/asset.model';
import { CompanyQuery } from 'src/app/core/store/company/company.query';
import { FieldDetails } from 'src/app/core/store/field-details/field-details.model';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-asset-card',
  templateUrl: './asset-card.component.html',
  styleUrls: ['./asset-card.component.scss']
})

export class AssetCardComponent implements OnInit, OnChanges {
  maxProgress = 1500;

  @Input()
  asset: AssetWithFields;

  @Input()
  commonFields: FieldDetails[];

  @Input()
  isCommonFieldsUsed: boolean;

  currentMergedFields$: Observable<FieldDetails[]>;
  allMergedFields$: Observable<FieldDetails[]>;
  status$: Observable<Status>;

  constructor(
    private companyQuery: CompanyQuery,
    private oispService: OispService,
    private statusService: StatusService,
    private router: Router) {
  }

  ngOnInit() {
    this.allMergedFields$ = this.oispService.getMergedFieldsByAssetWithFields(this.asset, environment.dataUpdateIntervalMs);
    this.updateMergedFields();
    this.status$ = this.statusService.getStatusFromMergedFields(this.currentMergedFields$);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isCommonFieldsUsed && this.currentMergedFields$) {
      this.updateMergedFields();
    }
  }

  private updateMergedFields() {
    this.currentMergedFields$ = this.getMergedFieldsIntersectedWithCommonFields();
  }

  private getMergedFieldsIntersectedWithCommonFields(): Observable<FieldDetails[]> {
    if (this.isCommonFieldsUsed) {
      return this.allMergedFields$.pipe(
        map(fields => {
          const descriptionsOfCommonFields: string[] = this.commonFields.map(value => value.description);
          return fields.filter(field => descriptionsOfCommonFields.includes(field.description));
        })
      );
    } else {
      return this.allMergedFields$;
    }
  }

  calculateMin(progress: number): number {
    return Math.min(progress / this.maxProgress * 100, 7);
  }

  goToDetails() {
    const companyId = this.companyQuery.getActiveId();
    const assetId = this.asset.id;
    this.router.navigateByUrl(
      `factorymanager/companies/${companyId}/assets/${assetId}`
    );
  }

}
