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
import { Observable } from 'rxjs';
import { Status } from 'src/app/factory/models/status.model';
import { OispService } from 'src/app/services/oisp.service';
import { StatusService } from 'src/app/services/status.service';
import { AssetWithFields } from 'src/app/store/asset/asset.model';
import { CompanyQuery } from 'src/app/store/company/company.query';
import { FieldDetails } from 'src/app/store/field-details/field-details.model';

@Component({
  selector: 'app-asset-card',
  templateUrl: './asset-card.component.html',
  styleUrls: ['./asset-card.component.scss']
})

export class AssetCardComponent implements OnInit, OnDestroy {
  maxProgress = 1500;

  @Input()
  asset: AssetWithFields;

  mergedFields$: Observable<FieldDetails[]>;
  status$: Observable<Status>;

  constructor(
    private companyQuery: CompanyQuery,
    private oispService: OispService,
    private statusService: StatusService,
    private router: Router) {
  }

  ngOnInit() {
    this.mergedFields$ = this.oispService.getMergedFieldsByAssetWithFields(this.asset);
    this.status$ = this.statusService.getStatusFromMergedFieldsAndAsset(this.mergedFields$, this.asset);
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
    this.router.navigateByUrl(
      `factorymanager/companies/${companyId}/assets/${assetId}`
    );
  }

}
