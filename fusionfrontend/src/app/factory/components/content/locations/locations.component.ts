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

import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { CompanyQuery } from 'src/app/store/company/company.query';
import { LocationWithAssetCount } from 'src/app/store/location/location.model';
import { LocationQuery } from 'src/app/store/location/location.query';
import { FactoryComposedQuery } from 'src/app/store/composed/factory-composed.query';
import { Location } from 'src/app/store/location/location.model';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit, OnDestroy {

  @Output()
  createLocationEvent = new EventEmitter<Location>();

  @Output()
  updateLocationEvent = new EventEmitter<Location>();

  isLoading$: Observable<boolean>;
  companyId: ID;
  locations$: Observable<LocationWithAssetCount[]>;
  locationMapping:
    { [k: string]: string } = { '=0': 'No factories', '=1': '# Factory site', other: '# Factory sites' };
  sortField: string;
  sortType: string;
  modalsActive = false;

  constructor(private companyQuery: CompanyQuery,
    private locationQuery: LocationQuery,
    private factoryComposedQuery: FactoryComposedQuery) { }

  ngOnInit() {
    this.isLoading$ = this.locationQuery.selectLoading();
    this.companyId = this.companyQuery.getActiveId();

    this.locations$ = this.factoryComposedQuery.selectLocationsOfCompanyWithAssetCount(this.companyId);
  }

  ngOnDestroy() {
  }

  openModal() {
    this.modalsActive = true;
  }

  closeModal(event: boolean) {
    this.modalsActive = event;
  }

  onSort(field: [string, string]) {
    this.sortField = field[0];
    this.sortType = field[1];
  }

  locationCreated(location: Location): void {
    this.createLocationEvent.emit(location);
  }

  locationUpdated(location: Location): void {
    this.updateLocationEvent.emit(location);
  }
}
