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
import { Resolve } from '@angular/router';

import { AssetSeriesService } from '../store/asset-series/asset-series.service';
import { CompanyQuery } from '../store/company/company.query';
import { Observable } from 'rxjs';
import { AssetSeries } from '../store/asset-series/asset-series.model';

@Injectable({ providedIn: 'root' })
export class AssetSeriesResolver implements Resolve<AssetSeries[]>{
  constructor(private companyQuery: CompanyQuery,
              private assetSeriesService: AssetSeriesService) { }

  resolve(): Observable<AssetSeries[]> {
    const companyId = this.companyQuery.getActiveId();
    if (companyId) {
      return this.assetSeriesService.getAssetSeriesOfCompany(companyId);
    } else {
      console.error('[asset series resolver]: company unknown');
    }
  }
}
