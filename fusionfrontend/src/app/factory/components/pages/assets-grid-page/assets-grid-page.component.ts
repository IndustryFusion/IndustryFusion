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
import { Observable } from 'rxjs';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { Asset, AssetWithFields } from 'src/app/store/asset/asset.model';
import { AssetQuery } from 'src/app/store/asset/asset.query';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { Room } from 'src/app/store/room/room.model';
import { FieldDetails } from '../../../../store/field-details/field-details.model';

@Component({
  selector: 'app-assets-grid-page',
  templateUrl: './assets-grid-page.component.html',
  styleUrls: ['./assets-grid-page.component.scss']
})
export class AssetsGridPageComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  factorySite$: Observable<FactorySite>;
  rooms$: Observable<Room[]>;
  assets$: Observable<Asset[]>;
  assetsWithFields$: Observable<AssetWithFields[]>;
  commonFields: FieldDetails[] = [];

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
    this.assetsWithFields$ = this.factoryResolver.assetsWithFields$;

    this.assetsWithFields$.subscribe(assetsWithFields => this.updateCommonFields(assetsWithFields));
  }

  ngOnDestroy() {
  }

  private updateCommonFields(assetsWithFields: AssetWithFields[]): void {
    this.commonFields = [];
    if (assetsWithFields && assetsWithFields.length > 0) {
      this.commonFields = assetsWithFields[0].fields;
      assetsWithFields.forEach(assetWithFields => {
        this.commonFields = this.commonFields
          .filter(commonField => assetWithFields.fields.some(assetField => commonField.description === assetField.description));
      });
    }
  }
}
