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
import { AssetDetails, AssetDetailsWithFields, AssetModalType } from '../../../../store/asset-details/asset-details.model';
import { FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-asset-instantiation',
  templateUrl: './asset-instantiation.component.html',
  styleUrls: ['./asset-instantiation.component.scss']
})
export class AssetInstantiationComponent implements OnInit, OnChanges {
  assetDetailsForm: FormGroup;
  assetSeries: AssetSeriesDetails[];
  locations: Location[];
  rooms: Room[];
  location: Location;
  activeModalType: AssetModalType;

  @Output()
  closedEvent = new EventEmitter<boolean>();
  @Output()
  assetSeriesSelectedEvent = new EventEmitter<AssetSeriesDetails>();
  @Output()
  assetDetailsEvent = new EventEmitter<AssetDetails>();
  @Output()
  stoppedAssetAssignment = new EventEmitter<boolean>();

  selectedAssetSeries: AssetSeriesDetails = new AssetSeriesDetails();
  assetToBeOnboarded: AssetDetails = new AssetDetails();
  allRoomsOfLocation: Room[];
  selectedLocation: Location;
  assetModalTypes = AssetModalType;
  formControls: string[];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) { }

  ngOnInit(): void {
    this.formControls = ['assetSeriesName', 'manufacturer', 'category', 'name', 'description', 'locationName'];
    this.assetDetailsForm = this.config.data.assetForm;
    this.assetSeries = this.config.data.assetSeries;
    this.locations = this.config.data.locations;
    this.rooms = this.config.data.rooms;
    this.activeModalType = this.config.data.activeModalType;

    if (this.location) {
      this.selectedLocation = this.location;
    } else {
      // this.selectedLocation = this.locations.filter(location => location.name === this.assetToBeOnboarded.get('locationName').pop();
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
    }
  }

  setAssetSeriesDetails() {
    this.assetDetailsForm.controls[this.formControls[0]].setValue(this.selectedAssetSeries.name);
    this.assetDetailsForm.controls[this.formControls[1]].setValue(this.selectedAssetSeries.manufacturer);
    this.assetDetailsForm.controls[this.formControls[2]].setValue(this.selectedAssetSeries.category);

    this.assetDetailsForm.controls[this.formControls[3]].setValue(this.selectedAssetSeries.name);
    this.assetDetailsForm.controls[this.formControls[4]].setValue(this.selectedAssetSeries.category);
  }

  clickedCustomize(event: boolean) {
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
      this.selectedLocation = event[1];
      this.allRoomsOfLocation = this.rooms.filter(room => room.locationId === this.selectedLocation.id);
      this.assetDetailsForm.controls[this.formControls[5]].setValue(this.selectedLocation.name);
    } else {
      this.config.header = 'Assign name and description to asset';
      this.activeModalType = this.assetModalTypes.customizeAsset;
    }
  }

  finishedAssetOnboaring(event: [boolean, Room]) {
    if (event[0]) {
      if (this.assetDetailsForm.valid) {
        const assetDetailsWithField = new AssetDetailsWithFields();
        assetDetailsWithField.id = this.assetDetailsForm.get('id')?.value;
        assetDetailsWithField.name = this.assetDetailsForm.get('name')?.value;
        assetDetailsWithField.description = this.assetDetailsForm.get('description')?.value;
        assetDetailsWithField.assetSeriesName = this.assetDetailsForm.get('assetSeriesName')?.value;
        assetDetailsWithField.manufacturer = this.assetDetailsForm.get('manufacturer')?.value;
        assetDetailsWithField.category = this.assetDetailsForm.get('category')?.value;
        assetDetailsWithField.locationName = this.assetDetailsForm.get('locationName')?.value;
        assetDetailsWithField.roomId = this.assetDetailsForm.get('room')?.value.id;
        assetDetailsWithField.roomName = this.assetDetailsForm.get('room')?.value.name;
        console.log(assetDetailsWithField);
        this.ref.close(assetDetailsWithField);
      }
    } else {
      this.config.header = 'Assign asset to location';
      this.activeModalType = this.assetModalTypes.locationAssignment;
    }
  }
}
