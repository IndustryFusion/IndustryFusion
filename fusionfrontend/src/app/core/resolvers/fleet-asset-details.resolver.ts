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
import { CompanyQuery } from '../store/company/company.query';
import { FleetAssetDetailsService } from '../store/fleet-asset-details/fleet-asset-details.service';
import { ID } from '@datorama/akita';
import { EMPTY, Observable } from 'rxjs';
import { FleetAssetDetails } from '../store/fleet-asset-details/fleet-asset-details.model';

@Injectable({ providedIn: 'root' })
export class FleetAssetDetailsResolver implements Resolve<void>{
  constructor(private companyQuery: CompanyQuery,
              private fleetAssetDetailsService: FleetAssetDetailsService) { }

  resolve(): void { // using Observable will (probably) result in deadlock when called from routing module
    this.resolveFromComponent().subscribe();
  }

  resolveFromComponent(): Observable<FleetAssetDetails[]> {
    const companyId: ID = this.companyQuery.getActiveId();
    if (companyId) {
      return this.fleetAssetDetailsService.getAssetDetailsOfCompany(companyId);
    } else {
      console.error('[fleet asset detail resolver]: company unknown');
      return EMPTY;
    }
  }
}
