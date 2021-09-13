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
import { Observable, Subject } from 'rxjs';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { FactoryAssetDetailsWithFields } from 'src/app/store/factory-asset-details/factory-asset-details.model';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { AssetType } from 'src/app/store/asset-type/asset-type.model';
import { Company, CompanyType } from 'src/app/store/company/company.model';
import { AssetTypesResolver } from 'src/app/resolvers/asset-types.resolver';
import { CompanyQuery } from 'src/app/store/company/company.query';
import { KairosStatusAggregationService } from '../../../../services/kairos-status-aggregation.service';
import { StatusHours } from '../../../../services/kairos-status-aggregation.model';

const MAINTENANCE_FIELD_NAME = 'Hours till maintenance';

@Component({
  selector: 'app-equipment-efficiency-page',
  templateUrl: './equipment-efficiency-page.component.html',
  styleUrls: ['./equipment-efficiency-page.component.scss']
})
export class EquipmentEfficiencyPageComponent implements OnInit {

  companyId: ID;
  factoryAssetDetailsWithFields$: Observable<FactoryAssetDetailsWithFields[]>;
  assetTypes$: Observable<AssetType[]>;
  factorySites$: Observable<FactorySite[]>;
  companies$: Observable<Company[]>;
  factoryAssetDetailsWithFields: FactoryAssetDetailsWithFields[];
  companies: Company[];

  date: Date = new Date(Date.now());

  isLoading$ = new Subject<boolean>();

  private assetsWithStatus: number;
  private loadedStatusCount = 0;

  constructor(
    private factoryResolver: FactoryResolver,
    private activatedRoute: ActivatedRoute,
    private assetTypesResolver: AssetTypesResolver,
    private companyQuery: CompanyQuery,
    private kairosStatusAggregationService: KairosStatusAggregationService,
  ) {
    this.isLoading$.next(true);
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
    this.factoryAssetDetailsWithFields$.subscribe(assetDetailsWithFields => {
      this.updateAssets(assetDetailsWithFields);
    });
  }

  private updateAssets(assetDetailsWithFields: FactoryAssetDetailsWithFields[]) {
    this.isLoading$.next(true);

    this.factoryAssetDetailsWithFields = assetDetailsWithFields;
    if (this.factoryAssetDetailsWithFields.length < 1) {
      console.warn('[equipment efficiency page]: No assets found');
    }
    this.sortAssetsByMaintenanceValue();
    this.addStatusHoursToAssets();

    if (this.assetsWithStatus === 0) {
      this.isLoading$.next(false);
    }
  }

  private sortAssetsByMaintenanceValue(): void {
    this.factoryAssetDetailsWithFields.sort((a, b) => {
      const indexA = a.fields.findIndex(field => field.name === MAINTENANCE_FIELD_NAME);
      const indexB = b.fields.findIndex(field => field.name === MAINTENANCE_FIELD_NAME);
      if (indexA !== -1 && indexB !== -1) {
        return Number(a.fields[indexA].value) > Number(b.fields[indexB].value) ? 1 : -1;
      } else if (indexA === -1) {
        return 1;
      } else {
        return -1;
      }
    });
  }

  private addStatusHoursToAssets(): void {
    this.assetsWithStatus = 0;
    this.loadedStatusCount = 0;

    this.factoryAssetDetailsWithFields.forEach(assetWithFields => {
      if (KairosStatusAggregationService.getStatusFieldOfAsset(assetWithFields) != null) {
        this.assetsWithStatus++;
        this.kairosStatusAggregationService.selectHoursPerStatusOfAsset(assetWithFields, this.date)
          .subscribe(assetStatusHours => this.updateStatusHoursOfAssetAndLoadingStatus(assetWithFields, assetStatusHours));
      }
    });
  }

  private updateStatusHoursOfAssetAndLoadingStatus(assetWithFields: FactoryAssetDetailsWithFields, statusHours: StatusHours[]) {
    assetWithFields.statusHours = statusHours;
    this.loadedStatusCount++;
    if (this.assetsWithStatus === this.loadedStatusCount) {
      this.isLoading$.next(false);
    }
  }

  dateChanged(date: Date) {
    this.date = date;
    this.updateAssets(this.factoryAssetDetailsWithFields);
  }
}
