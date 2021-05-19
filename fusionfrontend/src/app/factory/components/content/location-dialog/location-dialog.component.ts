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

import { Component, OnInit } from '@angular/core';
import { Location, LocationType } from 'src/app/store/location/location.model';
import { SelectItem } from 'primeng/api';
import { FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-location-dialog',
  templateUrl: './location-dialog.component.html',
  styleUrls: ['./location-dialog.component.scss']
})

export class LocationDialogComponent implements OnInit {

  locationForm: FormGroup;
  locationTypes: SelectItem[];
  formChange: Subscription;
  location: Location;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig) {
    this.locationTypes = [
      { label: 'Headquarter', value: LocationType.HEADQUARTER },
      { label: 'Fabrication', value: LocationType.FABRICATION },
    ];
  }

  ngOnInit() {
    this.locationForm = this.config.data.locationForm;
    this.location = { ...this.location, ...this.locationForm.value };
    this.formChange = this.locationForm.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.location = { ...this.location, ...this.locationForm.value };
      console.log(this.location);
    });

  }

  onCancel() {
    this.ref.close();
  }

  onSave() {
    if (this.locationForm.valid) {

      this.location.id = this.locationForm.get('id')?.value;
      this.location.name = this.locationForm.get('name')?.value;
      this.location.type = this.locationForm.get('type')?.value;
      this.location.line1 = this.locationForm.get('line1')?.value;
      this.location.line2 = this.locationForm.get('line2')?.value;
      this.location.zip = this.locationForm.get('zip')?.value;
      this.location.city = this.locationForm.get('city')?.value;
      this.location.country = this.locationForm.get('country')?.value;

      this.ref.close(this.location);
    } else {
      this.ref.close();
    }
  }

}

