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

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AssetSeriesDetails } from '../../../../store/asset-series-details/asset-series-details.model';
import { Room } from '../../../../store/room/room.model';
import { Location } from '../../../../store/location/location.model';
import { AssetDetails, AssetModalType } from '../../../../store/asset-details/asset-details.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ID } from '@datorama/akita';
import { AssetDetailsQuery } from 'src/app/store/asset-details/asset-details.query';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-asset-instantiation',
  templateUrl: './asset-instantiation.component.html',
  styleUrls: ['./asset-instantiation.component.scss']
})
export class AssetInstantiationComponent implements OnInit, OnChanges {

  @Input()
  assetSeries: AssetSeriesDetails[];

  @Input()
  locations: Location[];

  @Input()
  rooms: Room[];

  @Input()
  location: Location;

  @Input()
  modalsActive;

  @Input()
  initializeModalType: AssetModalType;

  @Input()
  assetDetailsID: ID;

  @Output()
  closedEvent = new EventEmitter<boolean>();

  @Output()
  assetSeriesSelectedEvent = new EventEmitter<AssetSeriesDetails>();

  @Output()
  assetDetailsEvent = new EventEmitter<AssetDetails>();

  @Output()
  stoppedAssetAssignment = new EventEmitter<boolean>();

  selectedAssetSeries: AssetSeriesDetails = new AssetSeriesDetails();
  instantiatedAsset: AssetDetails = new AssetDetails();
  assetToEdit: AssetDetails = new AssetDetails();
  allRoomsOfLocation: Room[];
  selectedLocation: Location;
  assetDetailsForm: FormGroup;
  assetDetails$: Observable<AssetDetails>;
  assetModalTypes = AssetModalType;
  modalTypeActive: AssetModalType;
  customNameControl = 'customName';
  descriptionControl = 'description';
  locationControl = 'location';
  roomNameControl = 'roomName';

  constructor(
    private assetDetailsQuery: AssetDetailsQuery,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.modalTypeActive = this.initializeModalType;
    if (this.assetDetailsID) {
      this.assetToEdit = this.assetDetailsQuery.getEntity(this.assetDetailsID);
      if (this.location) {
        this.selectedLocation = this.location;
      } else {
        this.selectedLocation = this.locations.filter(location => location.name === this.assetToEdit.locationName).pop();
      }
      this.createAssetDetailsForm(this.formBuilder, this.assetToEdit);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.assetSeries) {
      this.selectedAssetSeries = this.assetSeries[0];
    }
  }

  createAssetDetailsForm(formBuilder: FormBuilder, assetToEdit: AssetDetails) {
    this.assetDetailsForm = formBuilder.group({
      assetSeriesName: assetToEdit ? new FormControl(assetToEdit.assetSeriesName) : new FormControl(null),
      manufacturer: assetToEdit ? new FormControl(assetToEdit.manufacturer) : new FormControl(null),
      category: assetToEdit ? new FormControl(assetToEdit.category, Validators.required) : new FormControl(null, Validators.required),
      customName: assetToEdit ? new FormControl(assetToEdit.name) : new FormControl(null),
      description: assetToEdit ? new FormControl(assetToEdit.description) : new FormControl(null),
      location: assetToEdit ? new FormControl(assetToEdit.locationName, Validators.required) : new FormControl(null, Validators.required),
      roomName: assetToEdit ? new FormControl(assetToEdit.roomName , Validators.required) : new FormControl(null, Validators.required),
    });
  }

  clickedStartInstantiation(event: AssetSeriesDetails) {
    if (event) {
      this.selectedAssetSeries = event;
      this.modalTypeActive = this.assetModalTypes.customizeAsset;
      this.setAssetSeriesDetails();
      this.assetSeriesSelectedEvent.emit(this.selectedAssetSeries);
    }
  }

  setAssetSeriesDetails() {
    this.assetToEdit.assetSeriesName = this.selectedAssetSeries.name;
    this.assetToEdit.manufacturer = this.selectedAssetSeries.manufacturer;
    this.assetToEdit.category = this.selectedAssetSeries.category;

    this.assetToEdit.name = this.selectedAssetSeries.name;
    this.assetToEdit.description = this.selectedAssetSeries.category;
    this.createAssetDetailsForm(this.formBuilder, this.assetToEdit);
  }

  clickedCustomize(event: boolean) {
    if (event) {
      this.modalTypeActive = this.assetModalTypes.addDescription;
    }
  }

  clickedButtonOnDescription(event: boolean) {
    if (event) {
      this.modalTypeActive = this.assetModalTypes.locationAssignment;
      this.instantiatedAsset.name = this.assetDetailsForm.controls[this.customNameControl].value;
      this.instantiatedAsset.description = this.assetDetailsForm.controls[this.descriptionControl].value;
      this.instantiatedAsset.id = this.assetToEdit.id ? this.assetToEdit.id : null;
    } else {
      this.closeModal(true);
    }
  }

  finishedLocationAssignmentEvent(event: [boolean, Location]) {
    if (event[0]) {
      this.modalTypeActive = this.assetModalTypes.roomAssigntment;
      this.instantiatedAsset.locationName = this.assetDetailsForm.controls[this.locationControl].value;
      this.selectedLocation = event[1];
      this.allRoomsOfLocation = this.rooms.filter(room => room.locationId === event[1].id);
      this.instantiatedAsset.id = this.assetToEdit.id ? this.assetToEdit.id : null;
    } else {
      this.modalTypeActive = this.assetModalTypes.addDescription;
    }
  }

  finishInstantiation(event: [boolean, Room]) {
    if (event[0]) {
      this.modalTypeActive = null;
      this.instantiatedAsset.roomName = this.assetDetailsForm.controls[this.roomNameControl].value;
      this.instantiatedAsset.roomId = event[1].id;
      this.instantiatedAsset.locationName = this.selectedLocation ? this.selectedLocation.name : this.location.name;
      this.instantiatedAsset.id = this.assetToEdit.id ? this.assetToEdit.id : null;
      this.assetDetailsEvent.emit(this.instantiatedAsset);
      this.stoppedAssetAssignment.emit(false);
    } else {
      this.modalTypeActive = this.assetModalTypes.locationAssignment;
    }
  }

  closeModal(event: boolean) {
    if (event) {
      this.modalsActive = false;
      this.modalTypeActive = this.initializeModalType;
      this.stoppedAssetAssignment.emit(this.modalsActive);
    }
  }
}
