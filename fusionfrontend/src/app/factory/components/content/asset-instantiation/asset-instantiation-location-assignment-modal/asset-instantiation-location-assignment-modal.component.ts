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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Location } from '../../../../../store/location/location.model';

@Component({
  selector: 'app-asset-instantiation-location-assignment-modal',
  templateUrl: './asset-instantiation-location-assignment-modal.component.html',
  styleUrls: ['./asset-instantiation-location-assignment-modal.component.scss']
})
export class AssetInstantiationLocationAssignmentModalComponent implements OnInit {

  @Input()
  locations: Location[];
  @Input()
  selectedLocation: Location;
  @Output()
  locationAssignedEvent = new EventEmitter<[boolean, Location]>();

  filteredLocations: Location[];
  searchText: string;

  constructor() { }

  ngOnInit(): void {
    this.filteredLocations = this.locations;
  }

  filterLocations() {
    this.filteredLocations = this.locations.filter(location => location.name.toLowerCase()
      .includes(this.searchText.toLowerCase()));
  }

  nextButton() {
    this.locationAssignedEvent.emit([true, this.selectedLocation]);

  }

  backButton() {
    this.locationAssignedEvent.emit([false, null]);
  }
}
