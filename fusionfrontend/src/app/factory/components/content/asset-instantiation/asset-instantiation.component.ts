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
import { AssetSeriesDetails } from '../../../../store/asset-series-details/asset-series-details.model';
import { Room } from '../../../../store/room/room.model';
import { Location } from '../../../../store/location/location.model';
import { AssetDetailsWithFields, AssetModalType, AssetModalMode } from '../../../../store/asset-details/asset-details.model';
import { FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-asset-instantiation',
  templateUrl: './asset-instantiation.component.html',
  styleUrls: ['./asset-instantiation.component.scss']
})
export class AssetInstantiationComponent implements OnInit {
  assetDetailsForm: FormGroup;
  assetDetails: AssetDetailsWithFields;
  assetsToBeOnboarded: AssetDetailsWithFields[];
  assetSeries: AssetSeriesDetails[];
  locations: Location[];
  selectedLocation: Location;
  rooms: Room[];
  allRoomsOfLocation: Room[];
  selectedRoom: Room;
  activeModalType: AssetModalType;
  assetModalTypes = AssetModalType;
  activeModalMode: AssetModalMode;
  assetModalModes = AssetModalMode;
  formControls: string[];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) { }

  ngOnInit(): void {
    this.formControls = ['assetSeriesName', 'manufacturer', 'category', 'name', 'description', 'locationName', 'roomId', 'roomName'];
    this.assetDetailsForm = this.config.data.assetDetailsForm ? this.config.data.assetDetailsForm : null;
    this.assetSeries = this.config.data.assetSeries;
    this.assetDetails = this.config.data.assetToBeEdited;
    this.assetsToBeOnboarded = this.config.data.assetsToBeOnboarded;
    this.locations = this.config.data.locations;
    this.selectedLocation = this.config.data.location;
    this.rooms = this.config.data.rooms;
    this.activeModalMode = this.config.data.activeModalMode;
    this.activeModalType = this.config.data.activeModalType;

    if (this.activeModalMode === this.assetModalModes.editAssetMode) {
      if (this.assetDetailsForm.controls[this.formControls[5]].value !== null) {
        this.selectedLocation = this.locations.filter(location => location.name === this.assetDetailsForm
          .controls[this.formControls[5]].value)[0];
      }
      if (this.assetDetailsForm.controls[this.formControls[6]].value !== null) {
        this.selectedRoom = this.rooms.filter(room => room.id === this.assetDetailsForm.controls[this.formControls[6]].value)[0];
      }
    }

    if (this.activeModalMode === this.assetModalModes.editRoomForAssetMode) {
      this.selectedRoom = this.rooms.filter(room => room.id === this.assetDetails.roomId).pop();
      console.log(this.selectedLocation);
      if (this.selectedLocation)
        this.allRoomsOfLocation = this.rooms.filter(room => room.locationId === this.selectedRoom.locationId);
      else
        this.allRoomsOfLocation = this.rooms;
    }
  }

  onboardingStarted(event: AssetDetailsWithFields) {
    if (event) {
      this.assetDetails = event;
      this.activeModalType = this.assetModalTypes.pairAsset;
      this.updateAssetForm();
    }
  }

  updateAssetForm() {
    this.assetDetailsForm.controls[this.formControls[0]].setValue(this.assetDetails.assetSeriesName);
    this.assetDetailsForm.controls[this.formControls[1]].setValue(this.assetDetails.manufacturer);
    this.assetDetailsForm.controls[this.formControls[2]].setValue(this.assetDetails.category);
    this.assetDetailsForm.controls[this.formControls[3]].setValue(this.assetDetails.name ?
      this.assetDetails.name : this.assetDetails.assetSeriesName);
    this.assetDetailsForm.controls[this.formControls[4]].setValue(this.assetDetails.description ?
      this.assetDetails.description : this.assetDetails.category);
  }

  finishedPairing(event: boolean) {
    if (event) {
      this.config.header = 'Assign name and description to asset';
      this.config.contentStyle = { 'padding-top': '1.5%' };
      this.activeModalType = this.assetModalTypes.customizeAsset;
    }
  }

  finishedAddDescription(event: boolean) {
    if (event) {
      this.config.header = 'Assign asset to location';
      this.activeModalType = this.assetModalTypes.locationAssignment;
    } else {
      this.ref.close();
    }
  }

  finishedLocationAssignment(event: [boolean, Location]) {
    if (event[0]) {
      this.config.header = 'Assign asset to room';
      this.activeModalType = this.assetModalTypes.roomAssignment;
      this.assignLocation(event[1])
    } else {
      this.config.header = 'Assign name and description to asset';
      this.activeModalType = this.assetModalTypes.customizeAsset;
    }
  }

  assignLocation(location?: Location) {
    if (this.activeModalMode == this.assetModalModes.editRoomForAssetMode) {
      this.selectedLocation = this.locations.filter(location => location.id === this.selectedRoom.locationId)[0];
      this.assetDetailsForm.controls[this.formControls[5]].setValue(this.selectedLocation.name);
    } else if (location) {
      this.selectedLocation = location;
      this.allRoomsOfLocation = this.rooms.filter(room => room.locationId === this.selectedLocation.id);
      this.assetDetailsForm.controls[this.formControls[5]].setValue(this.selectedLocation.name);
    }
  }

  finishedRoomAssignment(event: [boolean, Room]) {
    if (event[0]) {
      this.assignRoom(event[1]);
      this.assignLocation();
      this.finishedAssetOnboaring();
    } else {
      this.config.header = 'Assign asset to location';
      this.activeModalType = this.assetModalTypes.locationAssignment;
    }
  }

  assignRoom(room: Room) {
    this.selectedRoom = room;
    this.assetDetailsForm.controls[this.formControls[6]].setValue(this.selectedRoom.id);
    this.assetDetailsForm.controls[this.formControls[7]].setValue(this.selectedRoom.name)
  }

  finishedAssetOnboaring() {
    if (this.assetDetailsForm.valid) {
      this.updateAssetDetailsObject();
      this.ref.close(this.assetDetails);
    }
  }

  updateAssetDetailsObject() {
    const assetFormValues = this.assetDetailsForm.value;
    this.assetDetails.roomId = assetFormValues.roomId;
    this.assetDetails.name = assetFormValues.name;
    this.assetDetails.description = assetFormValues.description;
    this.assetDetails.imageKey = assetFormValues.imageKey;
    this.assetDetails.manufacturer = assetFormValues.manufacturer;
    this.assetDetails.assetSeriesName = assetFormValues.assetSeriesName;
    this.assetDetails.category = assetFormValues.category;
    this.assetDetails.roomName = assetFormValues.roomName;
    this.assetDetails.locationName = assetFormValues.locationName;
  }

}
