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
// import { AssetDetailsQuery } from '../../../../store/asset-details/asset-details.query';
// import { forkJoin, Observable } from 'rxjs';
// import { switchMap } from 'rxjs/operators';
import { AssetDetailsWithFields } from 'src/app/store/asset-details/asset-details.model';
// import { FieldService } from 'src/app/store/field/field.service';
// import { FactoryComposedQuery } from 'src/app/store/composed/factory-composed.query';


@Component({
  selector: 'app-maintenance-page',
  templateUrl: './maintenance-page.component.html',
  styleUrls: ['./maintenance-page.component.scss']
})
export class MaintenancePageComponent implements OnInit {

  companyId: ID
  public assetsWithDetailsAndFields$: Observable<AssetDetailsWithFields[]>;
  
  constructor(
    private factoryResolver: FactoryResolver,
    private activatedRoute: ActivatedRoute
    // private assetDetailsQuery: AssetDetailsQuery,
    // private fieldService: FieldService,
    // private factoryComposedQuery: FactoryComposedQuery,
  ) { }

  ngOnInit(): void {
    this.factoryResolver.resolve(this.activatedRoute);

    this.assetsWithDetailsAndFields$ = this.factoryResolver.assetsWithDetailsAndFields$;
    
    // this.assetDetailsQuery.selectAssetDetailsOfCompany(this.companyId).pipe(
    //   switchMap(assetDetailsArray =>
    //     forkJoin(
    //       assetDetailsArray.map(assetDetails => this.fieldService.getFieldsOfAsset(this.companyId, assetDetails.id))))
    // ).subscribe();
    // this.assetsWithDetailsAndFields$ = this.factoryComposedQuery.joinFieldsOfAssetsDetailsWithOispData();
  }

}
