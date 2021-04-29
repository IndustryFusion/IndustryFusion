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

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location } from 'src/app/store/location/location.model';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-location-instantiation',
  templateUrl: './location-instantiation.component.html',
  styleUrls: ['./location-instantiation.component.scss']
})
export class LocationInstantiationComponent implements OnInit {

  @Input() @Output()
  modalsActive: boolean;
  @Input()
  companyId;
  @Input()
  locationToEdit: Location;
  @Output()
  createLocationEvent = new EventEmitter<Location>();
  @Output()
  updateLocationEvent = new EventEmitter<Location>();
  @Output()
  stopCreateLocation = new EventEmitter<boolean>();

  locationForm: FormGroup;
  formChange: Subscription;

  location: Location;
  initialLocation: Location = {
    id: null,
    companyId: 0,
    roomIds: null,
    rooms: null,
    name: '',
    line1: '',
    line2: '',
    city: '',
    zip: '',
    country: '',
    imageKey: null,
    latitude: 0,
    longitude: 0,
    type: null
  }

  editMode: boolean = false;

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    if (this.locationToEdit) {
      this.editMode = true;
      this.createFormGroupWithBuilderAndModel(this.formBuilder, this.locationToEdit);
    } else {
      this.createFormGroupWithBuilderAndModel(this.formBuilder, this.initialLocation);
    }
  }

  createFormGroupWithBuilderAndModel(formBuilder: FormBuilder, data: any) {
    this.locationForm = formBuilder.group({
      companyId: data ? data.companyId : null,
      roomIds: new FormControl(data ? data.roomsId : null, [Validators.required]),
      rooms: new FormControl(data ? data.rooms : null, [Validators.required]),
      name: new FormControl(data ? data.name : null, [Validators.required]),
      line1: data ? data.line1 : null,
      line2: data ? data.line2 : null,
      city: data ? data.city : null,
      zip: data ? data.zip : null,
      country: data ? data.country : null,
      imageKey: data ? data.imageKey : null,
      latitude: data ? data.latitude : null,
      longitude: data ? data.longitude : null,
      locationType: data ? data.type : null,
    });
    this.formChange = this.locationForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      let result = this.locationForm.value;
      this.location = result;
    });
  }

  locationCreated(event) {
    if (event) {
      this.location.companyId = this.companyId;
      this.createLocationEvent.emit(this.location);
    }
  }

  locationUpdated(event: Event) {
    if (event) {
      this.updateLocationEvent.emit(this.location);
    }
  }

  closeModal(event: boolean) {
    this.modalsActive = event;
    this.stopCreateLocation.emit(this.modalsActive);
  }

}
