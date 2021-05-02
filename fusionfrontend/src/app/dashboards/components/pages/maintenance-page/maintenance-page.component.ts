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
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { AssetDetailsWithFields } from 'src/app/store/asset-details/asset-details.model';
import { Location } from 'src/app/store/location/location.model';
import { AssetType } from 'src/app/store/asset-type/asset-type.model';
import { Company, CompanyType } from 'src/app/store/company/company.model';
import { AssetTypesResolver } from 'src/app/resolvers/asset-types.resolver';
import { CompanyQuery } from 'src/app/store/company/company.query';

const MAINTENANCE_FIELD_NAME = 'Hours till maintenance';

@Component({
  selector: 'app-maintenance-page',
  templateUrl: './maintenance-page.component.html',
  styleUrls: ['./maintenance-page.component.scss']
})
export class MaintenancePageComponent implements OnInit {

  companyId: ID
  assetDetailsWithFields$: Observable<AssetDetailsWithFields[]>;
  assetTypes$: Observable<AssetType[]>;
  locations$: Observable<Location[]>;
  companies$: Observable<Company[]>;
  assetDetailsWithFields: AssetDetailsWithFields[];
  companies: Company[];

  constructor(
    private factoryResolver: FactoryResolver,
    private activatedRoute: ActivatedRoute,
    private assetTypesResolver: AssetTypesResolver,
    private companyQuery: CompanyQuery,
  ) { }

  ngOnInit(): void {
    this.factoryResolver.resolve(this.activatedRoute);
    this.locations$ = this.factoryResolver.locations$;
    this.companies$ = this.companyQuery.selectAll();
    this.companies$.subscribe(res => {
      this.companies = res;
      this.companies.filter(company => company.type === CompanyType.MACHINE_MANUFACTURER);
    });
    this.assetTypes$ = this.assetTypesResolver.resolve();

    this.assetDetailsWithFields$ = this.factoryResolver.assetsWithDetailsAndFields$;
    this.assetDetailsWithFields$.subscribe(res => {
      this.assetDetailsWithFields = res;
      this.sortAssetsByMaintenanceValue();
    });
  }

  sortAssetsByMaintenanceValue() {
    this.assetDetailsWithFields.sort((a, b) => {
      const indexA = a.fields.findIndex(field => field.name === MAINTENANCE_FIELD_NAME)
      const indexB = b.fields.findIndex(field => field.name === MAINTENANCE_FIELD_NAME)
      if (indexA !== -1 && indexB !== -1) {
        return Number(a.fields[indexA].value) > Number(b.fields[indexB].value) ? 1 : -1;
      } else if (indexA === -1) {
        return 1;
      } else {
        return -1;
      }
    });
  }

}
