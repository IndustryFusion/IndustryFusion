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
import { FactoryAssetDetailsQuery } from '../../../../../core/store/factory-asset-details/factory-asset-details.query';
import { combineQueries } from '@datorama/akita';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FactoryAssetDetailsWithFields } from '../../../../../core/store/factory-asset-details/factory-asset-details.model';
import { FactoryComposedQuery } from '../../../../../core/store/composed/factory-composed.query';
import { AssetListType } from '../../../../../shared/models/asset-list-type.model';

@Component({
  selector: 'app-asset-subsystems',
  templateUrl: './asset-subsystems.component.html',
  styleUrls: ['./asset-subsystems.component.scss']
})
export class AssetSubsystemsComponent implements OnInit {

  AssetListType = AssetListType;

  subsystems$: Observable<FactoryAssetDetailsWithFields[]>;
  selected: FactoryAssetDetailsWithFields;

  public titleMapping:
    { [k: string]: string } = { '=0': 'No Subsystem', '=1': '# Subsystem', other: '# Subsystems' };


  constructor(
    private factoryAssetDetailsQuery: FactoryAssetDetailsQuery,
    private factoryComposedQuery: FactoryComposedQuery,
  ) { }

  ngOnInit(): void {
    this.subsystems$ = combineQueries([
      this.factoryAssetDetailsQuery.waitForActive(),
      this.factoryComposedQuery.selectAssetsWithFieldInstanceDetails()
    ]).pipe(
      map(([activeAsset, allAssets]) => {
        return allAssets.filter(asset => activeAsset.subsystemIds.includes(asset.id));
      })
    );
    this.subsystems$ = this.factoryComposedQuery.joinAssetsDetailsWithFieldInstancesWithAlerts(this.subsystems$);
  }
}
