/*
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
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
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationDialogComponent } from '../location-dialog/location-dialog.component';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
  providers: [DialogService]
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

  location: Location;
  locationForm: FormGroup;
  ref: DynamicDialogRef;


  constructor(
    private companyQuery: CompanyQuery,
    private locationQuery: LocationQuery,
    private factoryComposedQuery: FactoryComposedQuery,
    private formBuilder: FormBuilder,
    public dialogService: DialogService) { }

  ngOnInit() {
    this.isLoading$ = this.locationQuery.selectLoading();
    this.companyId = this.companyQuery.getActiveId();
    this.locations$ = this.factoryComposedQuery.selectLocationsOfCompanyWithAssetCount(this.companyId);
    this.createLocationForm(this.formBuilder);
  }

  onSort(field: [string, string]) {
    this.sortField = field[0];
    this.sortType = field[1];
  }

  showCreateDialog() {
    const ref = this.dialogService.open(LocationDialogComponent, {
      data: {
        locationForm: this.locationForm,
      },
      header: `Create new Location`,
      width: '70%',
      contentStyle: { 'padding-left': '6%', 'padding-right': '6%' },
    });

    ref.onClose.subscribe((location: Location) => {
      this.onCloseCreateDialog(location);
      this.createLocationForm(this.formBuilder);
      this.location = new Location();
    });
  }

  createLocationForm(formBuilder: FormBuilder) {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    this.locationForm = formBuilder.group({
      id: [null],
      name: ['', requiredTextValidator],
      line1: [''],
      line2: [''],
      city: ['', requiredTextValidator],
      zip: [''],
      country: ['', requiredTextValidator],
      type: [null, requiredTextValidator]
    });
  }

  onCloseCreateDialog(location: Location) {
    if (location) {
      location.companyId = this.companyId;
      this.locationCreated(location);
    }
  }

  locationCreated(location: Location): void {
    this.createLocationEvent.emit(location);
  }

  locationUpdated(location: Location): void {
    this.updateLocationEvent.emit(location);
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
