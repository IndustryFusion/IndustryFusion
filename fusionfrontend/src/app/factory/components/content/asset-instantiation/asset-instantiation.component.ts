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
import { FactorySite } from '../../../../store/factory-site/factory-site.model';
import {
  AssetModalMode,
  AssetModalType,
  FactoryAssetDetailsWithFields
} from '../../../../store/factory-asset-details/factory-asset-details.model';
import { FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

enum FormAttributes {
  assetSeriesName = 'assetSeriesName',
  manufacturer = 'manufacturer',
  category = 'category',
  name = 'name',
  description = 'description',
  factorySiteName = 'factorySiteName',
  roomId = 'roomId',
  roomName = 'roomName'
}

@Component({
  selector: 'app-asset-instantiation',
  templateUrl: './asset-instantiation.component.html',
  styleUrls: ['./asset-instantiation.component.scss']
})
export class AssetInstantiationComponent implements OnInit {
  assetDetailsForm: FormGroup;
  assetDetails: FactoryAssetDetailsWithFields;
  assetsToBeOnboarded: FactoryAssetDetailsWithFields[];
  factorySites: FactorySite[];
  selectedFactorySite: FactorySite;
  rooms: Room[];
  allRoomsOfFactorySite: Room[];
  selectedRoom: Room;
  activeModalType: AssetModalType;
  assetModalTypes = AssetModalType;
  activeModalMode: AssetModalMode;
  assetModalModes = AssetModalMode;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) { }

  ngOnInit(): void {
    this.assetDetailsForm = this.config.data.assetDetailsForm ? this.config.data.assetDetailsForm : null;
    this.assetDetails = { ...this.config.data.assetToBeEdited };
    this.assetsToBeOnboarded = this.config.data.assetsToBeOnboarded;
    this.factorySites = this.config.data.factorySites;
    this.selectedFactorySite = this.config.data.factorySite;
    this.rooms = this.config.data.rooms;
    this.activeModalMode = this.config.data.activeModalMode;
    this.activeModalType = this.config.data.activeModalType;

    if (this.activeModalMode !== this.assetModalModes.onboardAssetMode) {
      if (this.selectedFactorySite == null || this.assetDetailsForm.controls[FormAttributes.factorySiteName].value !== null) {
        this.selectedFactorySite = this.factorySites.filter(factorySite => factorySite.name === this.assetDetailsForm
          .controls[FormAttributes.factorySiteName].value).pop();
      }
      if (this.assetDetailsForm.controls[FormAttributes.roomId].value !== null) {
        this.selectedRoom = this.rooms.filter(room => room.id === this.assetDetailsForm.
          controls[FormAttributes.roomId].value).pop();
      }
      this.allRoomsOfFactorySite = this.rooms.filter(room => room.factorySiteId === this.selectedRoom.factorySiteId);
    }
  }

  onboardingStarted(event: FactoryAssetDetailsWithFields) {
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
    this.assetDetailsForm.controls[FormAttributes.assetSeriesName].setValue(this.assetDetails.assetSeriesName);
    this.assetDetailsForm.controls[FormAttributes.manufacturer].setValue(this.assetDetails.manufacturer);
    this.assetDetailsForm.controls[FormAttributes.category].setValue(this.assetDetails.category);
    this.assetDetailsForm.controls[FormAttributes.name].setValue(this.assetDetails.name ?
      this.assetDetails.name : this.assetDetails.assetSeriesName);
    this.assetDetailsForm.controls[FormAttributes.description].setValue(this.assetDetails.description ?
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
      this.config.header = 'Factory Site Assignment';
      this.activeModalType = this.assetModalTypes.factorySiteAssignment;
    } else {
      this.ref.close();
    }
  }

  finishedFactorySitesAssignment(event: FactorySite) {
    if (event) {
      this.config.header = 'Room Assignment ('  + event.name + ')';
      this.activeModalType = this.assetModalTypes.roomAssignment;
      this.assignFactorySite(event);
    } else {
      if (this.activeModalMode !== this.assetModalModes.editRoomForAssetMode) {
        this.config.header = 'General Information';
        this.activeModalType = this.assetModalTypes.customizeAsset;
      } else {
        this.ref.close();
      }
    }
  }

  assignFactorySite(selectedFactorySite?: FactorySite) {
    if (selectedFactorySite) {
      this.selectedFactorySite = selectedFactorySite;
    }
    this.allRoomsOfFactorySite = this.rooms.filter(room => room.factorySiteId === this.selectedFactorySite.id);
    this.assetDetailsForm.controls[FormAttributes.factorySiteName].setValue(this.selectedFactorySite.name);
  }

  finishedRoomAssignment(room: Room) {
    if (room) {
      this.assignRoom(room);
      this.assignFactorySite();
      this.finishedAssetOnboarding();
    } else {
      if (this.activeModalMode !== this.assetModalModes.editRoomWithPreselecedFactorySiteMode) {
        this.config.header = 'Factory Site Assignment';
        this.activeModalType = this.assetModalTypes.factorySiteAssignment;
      } else {
        this.ref.close();
      }
    }
  }

  assignRoom(room: Room) {
    this.selectedRoom = room;
    this.assetDetailsForm.controls[FormAttributes.roomId].setValue(this.selectedRoom.id);
    this.assetDetailsForm.controls[FormAttributes.roomName].setValue(this.selectedRoom.name);
  }

  finishedAssetOnboarding() {
    if (this.assetDetailsForm.valid) {
      this.updateAssetDetailsObject();
      this.ref.close(this.assetDetails);
    }
  }

  updateAssetDetailsObject() {
    const assetFormValues = this.assetDetailsForm.value;
    this.assetDetails.roomId = assetFormValues.roomId;
    this.assetDetails.version = assetFormValues.version;
    this.assetDetails.name = assetFormValues.name;
    this.assetDetails.description = assetFormValues.description;
    this.assetDetails.imageKey = assetFormValues.imageKey;
    this.assetDetails.manufacturer = assetFormValues.manufacturer;
    this.assetDetails.assetSeriesName = assetFormValues.assetSeriesName;
    this.assetDetails.category = assetFormValues.category;
    this.assetDetails.roomName = assetFormValues.roomName;
    this.assetDetails.factorySiteName = assetFormValues.factorySiteName;
  }

}
