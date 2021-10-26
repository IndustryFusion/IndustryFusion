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
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { AssetSeriesDetailsService } from '../store/asset-series-details/asset-series-details.service';
import { CompanyService } from '../store/company/company.service';
import { ID } from '@datorama/akita';
import { RouteHelpers } from '../common/utils/route-helpers';
import { CompanyQuery } from '../store/company/company.query';

@Injectable({ providedIn: 'root' })
export class AssetSeriesDetailsResolver implements Resolve<any>{
  constructor(private companyService: CompanyService,
              private companyQuery: CompanyQuery,
              private assetSeriesDetailsService: AssetSeriesDetailsService) { }

  resolve(route: ActivatedRouteSnapshot): void {
    this.companyService.getCompanies().subscribe();

    let companyId = RouteHelpers.findParamInFullActivatedRoute(route, 'companyId');
    if (!companyId) {
      companyId = this.companyQuery.getActiveId();
    } else {
      this.companyService.setActive(companyId);
    }

    this.resolveUsingCompanyId(companyId);
  }

  resolveUsingCompanyId(companyId: ID): void {
    if (companyId != null) {
      this.assetSeriesDetailsService.getAssetSeriesDetailsOfCompany(companyId).subscribe();
    }
  }
}
