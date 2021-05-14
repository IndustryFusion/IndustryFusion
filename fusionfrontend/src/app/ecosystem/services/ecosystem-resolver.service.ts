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

import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AssetTypeQuery } from '../../store/asset-type/asset-type.query';
import { AssetType } from '../../store/asset-type/asset-type.model';
import { EcosystemManagerPageType, RouteData } from '../ecosystem.routing.model';

@Injectable({
  providedIn: 'root'
})
export class EcoSystemManagerResolver {
  public assetType$: Observable<AssetType>;
  public assetTypes$: Observable<AssetType[]>;
  public ecoSystemManagerSubTitle$: Subject<string>;

  constructor(private assetTypeQuery: AssetTypeQuery) {
    this.assetType$ = this.assetTypeQuery.selectActive();
    this.ecoSystemManagerSubTitle$ = new BehaviorSubject('Apps');
  }

  resolve(activatedRoute: ActivatedRoute): void {
    const pageTypes: EcosystemManagerPageType[] = (activatedRoute.snapshot.data as RouteData).pageTypes || [];
    if (pageTypes.includes(EcosystemManagerPageType.ASSET_TYPE_DETAIL)) {
      this.assetTypeQuery
        .waitForActive()
        .subscribe(assetType => this.ecoSystemManagerSubTitle$.next('Asset Types > ' + assetType.name));
    }
    else if (pageTypes.includes(EcosystemManagerPageType.ASSET_TYPE_LIST)) {
      this.ecoSystemManagerSubTitle$.next('Asset Types');
    }
    else if (pageTypes.includes(EcosystemManagerPageType.ASSET_TYPE_TEMPLATE_LIST)) {
      this.ecoSystemManagerSubTitle$.next('Asset Type Templates');
    }
    else if (pageTypes.includes(EcosystemManagerPageType.METRIC_ATTRIBUTE_LIST)) {
      this.ecoSystemManagerSubTitle$.next('Metrics & Attributes');
    }
    else if (pageTypes.includes(EcosystemManagerPageType.QUANTITY_TYPE_LIST)) {
      this.ecoSystemManagerSubTitle$.next('Quantity Types');
    }
    else if (pageTypes.includes(EcosystemManagerPageType.UNIT_LIST)) {
      this.ecoSystemManagerSubTitle$.next('Units');
    }
    else {
      this.ecoSystemManagerSubTitle$.next('Apps');
    }
  }
}
