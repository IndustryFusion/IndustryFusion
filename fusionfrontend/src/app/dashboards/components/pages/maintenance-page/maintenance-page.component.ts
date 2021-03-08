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
import { AssetTypeQuery } from 'src/app/store/asset-type/asset-type.query';
import { Company } from 'src/app/store/company/company.model';


@Component({
  selector: 'app-maintenance-page',
  templateUrl: './maintenance-page.component.html',
  styleUrls: ['./maintenance-page.component.scss']
})
export class MaintenancePageComponent implements OnInit {

  companyId: ID
  assetsWithDetailsAndFields$: Observable<AssetDetailsWithFields[]>;
  assetTypes$: Observable<AssetType[]>;
  locations$: Observable<Location[]>;
  companies$: Observable<Company[]>;
  assetsDetailsAndFields: AssetDetailsWithFields[];
  
  constructor(
    private assetTypeQuery: AssetTypeQuery,
    private factoryResolver: FactoryResolver,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.factoryResolver.resolve(this.activatedRoute);
    this.locations$ = this.factoryResolver.locations$;
    this.companies$ = this.factoryResolver.companies$;
    this.assetTypes$ = this.assetTypeQuery.selectAll();

    this.assetsWithDetailsAndFields$ = this.factoryResolver.assetsWithDetailsAndFields$;
    this.assetsWithDetailsAndFields$.subscribe(res => {
      for(let asset of res) {
        let number = Math.floor(Math.random() * 1500 + 1);
        asset.videoKey = number.toString();
      }
      this.assetsDetailsAndFields = res;
      this.assetsDetailsAndFields.sort((a, b) => (Number(a.videoKey) > Number(b.videoKey)) ? 1 : -1);
    });
  }

}
