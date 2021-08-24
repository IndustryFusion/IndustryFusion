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
import { QuantityTypeQuery } from '../../store/quantity-type/quantity-type.query';
import { UnitQuery } from '../../store/unit/unit.query';
import { FieldQuery } from '../../store/field/field-query.service';
import { AssetTypeTemplateQuery } from '../../store/asset-type-template/asset-type-template.query';
import { NameWithVersionPipe } from '../../pipes/namewithversion.pipe';

@Injectable({
  providedIn: 'root'
})
export class EcoSystemManagerResolver {
  public assetType$: Observable<AssetType>;
  public ecoSystemManagerSubTitle$: Subject<string>;

  constructor(private assetTypeQuery: AssetTypeQuery,
              private unitQuery: UnitQuery,
              private fieldQuery: FieldQuery,
              private assetTypeTemplateQuery: AssetTypeTemplateQuery,
              private quantityTypeQuery: QuantityTypeQuery,
              private nameWithVersionPipe: NameWithVersionPipe) {
    this.assetType$ = this.assetTypeQuery.selectActive();
    this.ecoSystemManagerSubTitle$ = new BehaviorSubject('Apps');
  }

  resolve(activatedRoute: ActivatedRoute): void {
    const pageTypes: EcosystemManagerPageType[] = (activatedRoute.snapshot.data as RouteData).pageTypes || [];
    if (pageTypes.includes(EcosystemManagerPageType.ASSET_TYPE_DETAIL)) {
      this.assetTypeQuery
        .waitForActive()
        .subscribe(assetType => this.ecoSystemManagerSubTitle$.next(`Asset Types > ${assetType.name}`));
    } else if (pageTypes.includes(EcosystemManagerPageType.ASSET_TYPE_LIST)) {
      this.ecoSystemManagerSubTitle$.next('Asset Types');
    } else if (pageTypes.includes(EcosystemManagerPageType.ASSET_TYPE_TEMPLATE_LIST)) {
      this.ecoSystemManagerSubTitle$.next('Asset Type Templates');
    } else if (pageTypes.includes(EcosystemManagerPageType.FIELD_LIST)) {
      this.ecoSystemManagerSubTitle$.next('Metrics & Attributes');
    } else if (pageTypes.includes(EcosystemManagerPageType.QUANTITY_TYPE_LIST)) {
      this.ecoSystemManagerSubTitle$.next('Quantity Types');
    } else if (pageTypes.includes(EcosystemManagerPageType.QUANTITY_TYPE_DETAIL)) {
      this.quantityTypeQuery
        .waitForActive()
        .subscribe(quantityType => this.ecoSystemManagerSubTitle$.next(`Quantity Types > ${quantityType.name}`));
    } else if (pageTypes.includes(EcosystemManagerPageType.ASSET_TYPE_TEMPLATE_DETAIL)) {
      this.assetTypeTemplateQuery
        .waitForActive()
        .subscribe(assetTypeTemplate => this.ecoSystemManagerSubTitle$.next(`Asset Type Templates > ${this.nameWithVersionPipe.transform(assetTypeTemplate.name, assetTypeTemplate.publishedVersion)}`));
    } else if (pageTypes.includes(EcosystemManagerPageType.FIELD_DETAIL)) {
      this.fieldQuery
        .waitForActive()
        .subscribe(field => this.ecoSystemManagerSubTitle$.next(`Metrics & Attributes > ${field.name}`));
    } else if (pageTypes.includes(EcosystemManagerPageType.UNIT_LIST)) {
      this.ecoSystemManagerSubTitle$.next('Units');
    } else if (pageTypes.includes(EcosystemManagerPageType.UNIT_DETAIL)) {
      this.unitQuery
        .waitForActive()
        .subscribe(unit => this.ecoSystemManagerSubTitle$.next(`Units > ${unit.name}`));
    } else {
      this.ecoSystemManagerSubTitle$.next(`Apps`);
    }
  }
}
