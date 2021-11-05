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

import { CompanyService } from '../store/company/company.service';
import { AssetService } from '../store/asset/asset.service';
import { CompanyQuery } from '../store/company/company.query';

@Injectable({ providedIn: 'root' })
export class AssetResolver implements Resolve<any>{
  constructor(private companyService: CompanyService,
              private companyQuery: CompanyQuery,
              private assetService: AssetService) { }

  resolve(route: ActivatedRouteSnapshot): void {

    let companyId = this.companyQuery.getActiveId();
    if (route.parent) {
      this.companyService.getCompanies().subscribe();
      companyId = route.parent.params.companyId;
      this.companyService.setActive(companyId);
    }

    if (companyId != null) {
      this.assetService.getAssetsOfCompany(companyId).subscribe();
    }
  }
}
