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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { PointWithId } from 'src/app/services/oisp.model';
import { Asset, AssetWithFields } from 'src/app/store/asset/asset.model';
import { AssetQuery } from 'src/app/store/asset/asset.query';
import { FieldDetails } from 'src/app/store/field-details/field-details.model';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { Room } from 'src/app/store/room/room.model';

@Component({
  selector: 'app-asset-page',
  templateUrl: './asset-page.component.html',
  styleUrls: ['./asset-page.component.scss']
})
export class AssetPageComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  factorySite$: Observable<FactorySite>;
  rooms$: Observable<Room[]>;
  assets$: Observable<Asset[]>;
  asset$: Observable<Asset>;
  fields$: Observable<FieldDetails[]>;
  latestPoints$: Observable<PointWithId[]>;
  mergedFields$: Observable<FieldDetails[]>;
  assetsWithFields$: Observable<AssetWithFields[]>;
  companyId: ID;
  assetId: ID;

  constructor(
    private assetQuery: AssetQuery,
    private factoryResolver: FactoryResolver,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading$ = this.assetQuery.selectLoading();
    this.factoryResolver.resolve(this.activatedRoute);
    this.factorySite$ = this.factoryResolver.factorySite$;
    this.rooms$ = this.factoryResolver.rooms$;
    this.assets$ = this.factoryResolver.assets$;
    this.asset$ = this.factoryResolver.asset$;
    this.fields$ = this.factoryResolver.fields$;
    this.assetsWithFields$ = this.factoryResolver.assetsWithFields$;
  }

  ngOnDestroy() {
  }
}
