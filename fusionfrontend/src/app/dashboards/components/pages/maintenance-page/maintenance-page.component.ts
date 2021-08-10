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
import { combineLatest, Observable } from 'rxjs';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { FactoryAssetDetailsWithFields } from 'src/app/store/factory-asset-details/factory-asset-details.model';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { AssetType } from 'src/app/store/asset-type/asset-type.model';
import { Company, CompanyType } from 'src/app/store/company/company.model';
import { AssetTypesResolver } from 'src/app/resolvers/asset-types.resolver';
import { CompanyQuery } from 'src/app/store/company/company.query';
import { OispService } from '../../../../services/oisp.service';
import { PointWithId } from '../../../../services/oisp.model';
import { FieldDetails } from '../../../../store/field-details/field-details.model';
import { mergeMap } from 'rxjs/operators';

// const MAINTENANCE_FIELD_NAME_OPERATING_HOURS = 'Operating Hours till maintenance';

@Component({
  selector: 'app-maintenance-page',
  templateUrl: './maintenance-page.component.html',
  styleUrls: ['./maintenance-page.component.scss']
})
export class MaintenancePageComponent implements OnInit {

  companyId: ID;
  factoryAssetDetailsWithFields$: Observable<FactoryAssetDetailsWithFields[]>;
  factoryAssetDetailsWithFieldsAndValues: Observable<FactoryAssetDetailsWithFields[]>;
  assetTypes$: Observable<AssetType[]>;
  factorySites$: Observable<FactorySite[]>;
  companies$: Observable<Company[]>;
  companies: Company[];

  MAINTENANCE_FIELD_NAME_DAYS = 'Days till maintenance';

  constructor(
    private factoryResolver: FactoryResolver,
    private activatedRoute: ActivatedRoute,
    private assetTypesResolver: AssetTypesResolver,
    private companyQuery: CompanyQuery,
    private oispService: OispService,
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

    this.factoryAssetDetailsWithFields$ = this.factoryResolver.assetsWithDetailsAndFields$;

    this.factoryAssetDetailsWithFieldsAndValues = this.factoryAssetDetailsWithFields$.pipe(
      mergeMap((assets) =>
        combineLatest(
          assets.map((asset) => {
            return this.updateAssetWithFieldValue(asset);
          })
        )
      ),
    );
  }

  private updateAssetWithFieldValue(asset: FactoryAssetDetailsWithFields) {
    return new Observable<any>((observer) => {
      this.oispService.getLastValueOfAllFields(asset, asset.fields, 600).subscribe((lastValues) => {
          asset.fields = this.getAssetFieldValues(asset, lastValues);
          observer.next(asset);
        }, _ => {
          observer.next(null);
        }
      );
    });
  }

  private getAssetFieldValues(asset: FactoryAssetDetailsWithFields, lastValues: PointWithId[]): FieldDetails[] {
    return asset.fields.map((field) => {
        const fieldCopy = Object.assign({ }, field);
        const point = lastValues?.find(latestPoint => latestPoint.id === field.externalId);
        if (point) {
          fieldCopy.value = point.value;
        }
        return fieldCopy;
      }
    );
  }

}
