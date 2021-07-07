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
    this.formControls = ['assetSeriesName', 'manufacturer', 'category', 'name', 'description', 'locationName',
      'roomId', 'roomName'];
    this.assetDetailsForm = this.config.data.assetDetailsForm ? this.config.data.assetDetailsForm : null;
    this.assetDetails = { ...this.config.data.assetToBeEdited };
    this.assetsToBeOnboarded = this.config.data.assetsToBeOnboarded;
    this.locations = this.config.data.locations;
    this.selectedLocation = this.config.data.location;
    this.rooms = this.config.data.rooms;
    this.activeModalMode = this.config.data.activeModalMode;
    this.activeModalType = this.config.data.activeModalType;

    if (this.activeModalMode !== this.assetModalModes.onboardAssetMode) {
      if (this.selectedLocation == null || this.assetDetailsForm.controls[this.formControls[5]].value !== null) {
        this.selectedLocation = this.locations.filter(location => location.name === this.assetDetailsForm
          .controls[this.formControls[5]].value).pop();
      }
      if (this.assetDetailsForm.controls[this.formControls[6]].value !== null) {
        this.selectedRoom = this.rooms.filter(room => room.id === this.assetDetailsForm.
          controls[this.formControls[6]].value).pop();
      }
      this.allRoomsOfLocation = this.rooms.filter(room => room.locationId === this.selectedRoom.locationId);
    }
  }

  onboardingStarted(event: AssetDetailsWithFields) {
    if (event) {
      this.assetDetails = event;
      this.config.header = 'Pairing Asset';
      this.config.width = '51%';
      this.config.contentStyle = { 'padding-top': '3%' };
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
      this.config.header = 'General Information';
      this.config.contentStyle = { 'padding-top': '1.5%' };
      this.activeModalType = this.assetModalTypes.customizeAsset;
    }
  }

  finishedAddDescription(event: boolean) {
    if (event) {
      this.config.header = 'Location Assignment';
      this.activeModalType = this.assetModalTypes.locationAssignment;
    } else {
      this.ref.close();
    }
  }

  finishedLocationAssignment(event: Location) {
    if (event) {
      this.config.header = 'Room Assignment ('  + event.name + ')';
      this.activeModalType = this.assetModalTypes.roomAssignment;
      this.assignLocation(event);
    } else {
      if (this.activeModalMode !== this.assetModalModes.editRoomForAssetMode) {
        this.config.header = 'General Information';
        this.activeModalType = this.assetModalTypes.customizeAsset;
      } else {
        this.ref.close();
      }
    }
  }

  assignLocation(selectedLocation?: Location) {
    if (selectedLocation) {
      this.selectedLocation = selectedLocation;
    }
    this.allRoomsOfLocation = this.rooms.filter(room => room.locationId === this.selectedLocation.id);
    this.assetDetailsForm.controls[this.formControls[5]].setValue(this.selectedLocation.name);
  }

  finishedRoomAssignment(event: Room) {
    if (event) {
      this.assignRoom(event);
      this.assignLocation();
      this.finishedAssetOnboaring();
    } else {
      if (this.activeModalMode !== this.assetModalModes.editRoomWithPreselecedLocationMode) {
        this.config.header = 'Location Assignment';
        this.activeModalType = this.assetModalTypes.locationAssignment;
      } else {
        this.ref.close();
      }
    }
  }

  assignRoom(room: Room) {
    this.selectedRoom = room;
    this.assetDetailsForm.controls[this.formControls[6]].setValue(this.selectedRoom.id);
    this.assetDetailsForm.controls[this.formControls[7]].setValue(this.selectedRoom.name);
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
