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

import { Component, OnInit, DoCheck, IterableDiffers, IterableDiffer } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormGroup } from '@angular/forms';
import { Room } from '../../../../store/room/room.model';
import { FactoryAssetDetails } from 'src/app/store/factory-asset-details/factory-asset-details.model';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';

@Component({
  selector: 'app-assign-asset-to-room',
  templateUrl: './assign-asset-to-room.component.html',
  styleUrls: ['./assign-asset-to-room.component.scss']
})
export class AssignAssetToRoomComponent implements OnInit, DoCheck {

  assets: FactoryAssetDetails[];
  filteredAssets: FactoryAssetDetails[];
  selectedAssets: FactoryAssetDetails[] = [];
  room: Room;
  rooms: Room[];
  factorySites: FactorySite[];
  assetAndFactorySitesMap = new Map();
  factorySitesAndRoomsMap = new Map();
  roomForm: FormGroup;
  searchText: string;
  allAssetsSelected: boolean;
  iterableDiffer: IterableDiffer<FactoryAssetDetails>;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public iterableDiffers: IterableDiffers) {
    this.iterableDiffer = iterableDiffers.find([]).create(null);
  }

  ngOnInit(): void {
    this.roomForm = this.config.data.roomForm;
    this.assets = this.config.data.factoryAssets;
    this.room = this.config.data.room;
    this.rooms = this.config.data.rooms;
    this.factorySites = this.config.data.factorySites;
    this.filteredAssets = this.assets;
    this.factorySitesAndRoomsMap = this.config.data.factorySitesAndRoomsMap;

    console.log(this.assets);
    this.assets.forEach(asset => {
      this.fillAssetFactorySitesMap(asset);
      this.prefillSelectedItems(asset);
    });
    this.checkIfSelectedAssetsEqualsAllAssets();
  }

  ngDoCheck() {
    const changes = this.iterableDiffer.diff(this.selectedAssets);
    if (changes) {
      this.checkIfSelectedAssetsEqualsAllAssets();
    }
  }

  checkIfSelectedAssetsEqualsAllAssets() {
    this.allAssetsSelected = this.selectedAssets.length === this.assets.length;
  }

  fillAssetFactorySitesMap(asset: FactoryAssetDetails) {
    this.assetAndFactorySitesMap.set(asset.id, this.factorySitesAndRoomsMap.get(asset.roomId));
  }

  prefillSelectedItems(asset: FactoryAssetDetails) {
    this.room.assetIds.forEach(assetId => {
      if (assetId === asset.id) {
        this.selectedAssets.push(asset);
      }
    });
  }

  filterAssets() {
    this.filteredAssets = this.assets.filter(asset => asset.name.toLowerCase()
      .includes(this.searchText.toLowerCase()));
  }

  unselectItem(unselectedAsset: FactoryAssetDetails) {
    this.selectedAssets = this.selectedAssets.filter(selectedAsset => selectedAsset.id !== unselectedAsset.id);
    console.log(this.selectedAssets);
    console.log(unselectedAsset);
  }

  onCancel() {
    this.ref.close();
  }

  onApply() {
    this.ref.close(this.selectedAssets);
  }

  selectAllAssets() {
    if (this.allAssetsSelected) {
      this.selectedAssets = this.assets;
    } else {
      this.selectedAssets = [];
    }
  }

}
