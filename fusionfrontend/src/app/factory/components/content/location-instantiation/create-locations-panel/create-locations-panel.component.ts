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

import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { LocationType } from 'src/app/store/location/location.model';
import { SelectItem } from 'primeng/api';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-locations-panel',
  templateUrl: './create-locations-panel.component.html',
  styleUrls: ['./create-locations-panel.component.scss']
})
export class CreateLocationsPanelComponent implements OnInit {

  @Input()
  display: boolean;
  @Input()
  locationForm: FormGroup;
  @Input()
  editMode: boolean;
  @Output()
  createLocationEvent = new EventEmitter<boolean>();
  @Output()
  updateLocationEvent = new EventEmitter<boolean>();
  @Output()
  stopCreateLocation = new EventEmitter<boolean>();

  searchText: string;

  countries: SelectItem[];
  locationTypes: SelectItem[];
  selectedCountry: string;
  selectedLocationType: LocationType;

  constructor() {
    this.countries = [
      { label: 'Germany', value: 'Germany' },
      { label: 'Switzerland', value: 'Switzerland' },
      { label: 'Austria', value: 'Austria' }
    ];

    this.locationTypes = [
      { label: 'Headquater', value: LocationType.HEADQUARTER },
      { label: 'Fabrication', value: LocationType.FABRICATION },
    ]
  }

  ngOnInit(): void {
  }

  continueCreation(): void {
    if (this.editMode) {
      this.updateLocationEvent.emit(true);
    } else {
      this.createLocationEvent.emit(true);
    }
    this.display = false;
  }

  cancel() {
    this.display = false;
    this.stopCreateLocation.emit(false);
  }
}
