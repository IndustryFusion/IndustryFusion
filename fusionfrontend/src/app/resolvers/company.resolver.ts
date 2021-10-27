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
import { RouteHelpers } from '../common/utils/route-helpers';

@Injectable({ providedIn: 'root' })
export class CompanyResolver implements Resolve<any>{
  constructor(private companyService: CompanyService) { }

  resolve(route: ActivatedRouteSnapshot): void { // using Observable will result in deadlock
    const companyId = RouteHelpers.findParamInFullActivatedRoute(route, 'companyId');
    this.companyService.setActive(companyId);

    this.companyService.getCompanies().subscribe();
  }
}
