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
import { FactorySiteService } from '../store/factory-site/factory-site.service';
import { EMPTY, Observable } from 'rxjs';
import { CompanyQuery } from '../store/company/company.query';
import { FactorySite } from '../store/factory-site/factory-site.model';

@Injectable({ providedIn: 'root' })
export class FactorySiteResolver implements Resolve<void>{
  constructor(private companyQuery: CompanyQuery,
              private factorySiteService: FactorySiteService) { }

  resolve(): void { // using Observable will result in deadlock when called from routing module
    this.resolveFromComponent().subscribe();
  }

  resolveFromComponent(): Observable<FactorySite[]> {
    const companyId = this.companyQuery.getActiveId();
    if (companyId) {
      return  this.factorySiteService.getFactorySitesWithoutShiftSettings(companyId);
    } else {
      console.error('[asset series details resolver]: company unknown');
      return EMPTY;
    }
  }
}
