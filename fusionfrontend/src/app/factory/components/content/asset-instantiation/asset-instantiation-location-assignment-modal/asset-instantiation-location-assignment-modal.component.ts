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

import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Location } from '../../../../../store/location/location.model';
import { FormGroup } from '@angular/forms';

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

  @Input()
  assetDetailsForm: FormGroup;

  @Output()
  finishedLocationAssignmentEvent = new EventEmitter<[boolean, Location]>();

  @Output()
  selectedLocationEvent = new EventEmitter<Location>();

  @Output()
  stoppedAssetAssignment = new EventEmitter<boolean>();

  locationControlValidation = 'location';

  constructor() { }

  ngOnInit(): void {
  }

  radioChecked(location: Location) {
    this.selectedLocation = location;
  }

  emitClickedButtonEvent(event: boolean) {
    if (event) {
      if (this.assetDetailsForm.controls[this.locationControlValidation].valid) {
        this.finishedLocationAssignmentEvent.emit([event, this.selectedLocation]);
      }
    } else {
      this.finishedLocationAssignmentEvent.emit([event, null]);
    }
  }

  closeModal(event: boolean) {
    if (event) {
      this.stoppedAssetAssignment.emit(event);
    }
  }

}
