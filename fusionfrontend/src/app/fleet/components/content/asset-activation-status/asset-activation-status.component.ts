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

import { Component, Input, OnInit } from '@angular/core';
import { FactoryAssetDetailsWithFields } from '../../../../core/store/factory-asset-details/factory-asset-details.model';
import { map, switchMap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { AssetSeriesDetailsQuery } from '../../../../core/store/asset-series-details/asset-series-details.query';

@Component({
  selector: 'app-asset-activation-status',
  templateUrl: './asset-activation-status.component.html',
  styleUrls: ['./asset-activation-status.component.scss']
})
export class AssetActivationStatusComponent implements OnInit {

  @Input()
  asset$: Observable<FactoryAssetDetailsWithFields>;

  @Input()
  showInline: boolean;

  isActive$: Observable<boolean>;

  constructor(
    private assetSeriesQuery: AssetSeriesDetailsQuery
  ) {
  }

  ngOnInit(): void {
    const assetSeries$ = this.asset$.pipe(
      switchMap(asset => this.assetSeriesQuery.selectAssetSeriesDetails(asset?.assetSeriesId))
    );
    this.isActive$ = combineLatest(([this.asset$, assetSeries$])).pipe(map(([asset, series]) => {
      return series.companyId !== asset.companyId;
    }));
  }

}
