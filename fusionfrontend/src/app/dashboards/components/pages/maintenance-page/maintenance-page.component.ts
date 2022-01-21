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
import { FactoryAssetDetailsWithFields } from 'src/app/core/store/factory-asset-details/factory-asset-details.model';
import { FactorySite } from 'src/app/core/store/factory-site/factory-site.model';
import { AssetType } from 'src/app/core/store/asset-type/asset-type.model';
import { Company, CompanyType } from 'src/app/core/store/company/company.model';
import { AssetTypesResolver } from 'src/app/core/resolvers/asset-types.resolver';
import { CompanyQuery } from 'src/app/core/store/company/company.query';
import { Field } from '../../../../core/store/field/field.model';
import { FieldsResolver } from '../../../../core/resolvers/fields-resolver';

@Component({
  selector: 'app-maintenance-page',
  templateUrl: './maintenance-page.component.html',
  styleUrls: ['./maintenance-page.component.scss']
})
export class MaintenancePageComponent implements OnInit {

  companyId: ID;
  factoryAssetDetailsWithFieldsAndValues$: Observable<FactoryAssetDetailsWithFields[]>;
  assetTypes$: Observable<AssetType[]>;
  factorySites$: Observable<FactorySite[]>;
  companies$: Observable<Company[]>;
  companies: Company[];
  fields$: Observable<Field[]>;

  MAINTENANCE_FIELD_NAME_DAYS = 'Days till maintenance';

  constructor(
    private factoryResolver: FactoryResolver,
    private activatedRoute: ActivatedRoute,
    private assetTypesResolver: AssetTypesResolver,
    private companyQuery: CompanyQuery,
    private fieldsResolver: FieldsResolver,
  ) {
  }

  ngOnInit(): void {
    this.factoryResolver.resolve(this.activatedRoute);
    this.factorySites$ = this.factoryResolver.factorySites$;
    this.companies$ = this.companyQuery.selectAll();
    this.companies$.subscribe(res => {
      this.companies = res;
      this.companies.filter(company => company.type === CompanyType.MACHINE_MANUFACTURER);
    });
    this.assetTypes$ = this.assetTypesResolver.resolve();
    this.factoryAssetDetailsWithFieldsAndValues$ = this.factoryResolver.assetsWithDetailsAndFieldsAndValues$;
    this.fields$ = this.fieldsResolver.resolve();
  }

}
