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

import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AssetSeriesDetails } from '../../../../store/asset-series-details/asset-series-details.model';
import { Room } from '../../../../store/room/room.model';
import { Location } from '../../../../store/location/location.model';
import { AssetDetails, AssetModalType } from '../../../../store/asset-details/asset-details.model';
import { FormGroup } from '@angular/forms';
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-asset-instantiation',
  templateUrl: './asset-instantiation.component.html',
  styleUrls: ['./asset-instantiation.component.scss']
})
export class AssetInstantiationComponent implements OnInit, OnChanges {

  assetForm: FormGroup;
  assetSeries: AssetSeriesDetails[];
  locations: Location[];
  rooms: Room[];
  location: Location;
  activeModalType: AssetModalType;
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
  formControls = ['assetSeriesName', 'manufacturer', 'category', 'name', 'description'];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) { }

  ngOnInit(): void {
    this.assetForm = this.config.data.assetForm;
    this.assetSeries = this.config.data.assetSeries;
    this.rooms = this.config.data.rooms;
    this.activeModalType = this.config.data.activeModalType;

    if (this.location) {
      this.selectedLocation = this.location;
    } else {
      // this.selectedLocation = this.locations.filter(location => location.name === this.assetForm.get("locationName").pop();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.assetSeries) {
      this.selectedAssetSeries = this.assetSeries[0];
    }
  }

  clickedStartInstantiation(event: AssetSeriesDetails) {
    if (event) {
      this.selectedAssetSeries = event;
      this.activeModalType = this.assetModalTypes.pairAsset;
      this.setAssetSeriesDetails();
      // this.assetSeriesSelectedEvent.emit(this.selectedAssetSeries);
    }
  }

  setAssetSeriesDetails() {
    this.assetForm.controls[this.formControls[0]].setValue(this.selectedAssetSeries.name);
    this.assetForm.controls[this.formControls[1]].setValue(this.selectedAssetSeries.manufacturer);
    this.assetForm.controls[this.formControls[2]].setValue(this.selectedAssetSeries.category);

    this.assetForm.controls[this.formControls[3]].setValue(this.selectedAssetSeries.name);
    this.assetForm.controls[this.formControls[4]].setValue(this.selectedAssetSeries.category);
  }

  clickedCustomize(event: boolean) {
    if (event) {
      this.activeModalType = this.assetModalTypes.customizeAsset;
    }
  }

  clickedButtonOnDescription(event: boolean) {
    if (event) {
      this.activeModalType = this.assetModalTypes.locationAssignment;
      this.instantiatedAsset.name = this.assetDetailsForm.controls[this.customNameControl].value;
      this.instantiatedAsset.description = this.assetDetailsForm.controls[this.descriptionControl].value;
      this.instantiatedAsset.id = this.assetToEdit.id ? this.assetToEdit.id : null;
    }
  }

  finishedLocationAssignmentEvent(event: [boolean, Location]) {
    if (event[0]) {
      this.activeModalType = this.assetModalTypes.roomAssignment;
      this.instantiatedAsset.locationName = this.assetDetailsForm.controls[this.locationControl].value;
      this.selectedLocation = event[1];
      this.allRoomsOfLocation = this.rooms.filter(room => room.locationId === event[1].id);
      this.instantiatedAsset.id = this.assetToEdit.id ? this.assetToEdit.id : null;
    } else {
      this.activeModalType = this.assetModalTypes.customizeAsset;
    }
  }

  finishInstantiation(event: [boolean, Room]) {
    if (event[0]) {
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

}
