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

import { AssetSeriesDetailsService } from '../store/asset-series-details/asset-series-details.service';
import { CompanyQuery } from '../store/company/company.query';
import { EMPTY, Observable } from 'rxjs';
import { AssetSeriesDetails } from '../store/asset-series-details/asset-series-details.model';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AssetSeriesDetailsResolver implements Resolve<AssetSeriesDetails[]>{
  constructor(private companyQuery: CompanyQuery,
              private assetSeriesDetailsService: AssetSeriesDetailsService) { }

  resolve(): Observable<AssetSeriesDetails[]> {
    return this.companyQuery.waitForActive().pipe(switchMap(company => {
      if (company) {
        return this.assetSeriesDetailsService.getAssetSeriesDetailsOfCompany(company.id);
      } else {
        console.error('[asset series details resolver]: company unknown');
        return EMPTY;
      }
    }));

  }
}
