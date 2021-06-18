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

import { Location as loc } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { AssetService } from 'src/app/store/asset/asset.service';
import { Company } from 'src/app/store/company/company.model';
import { Location } from 'src/app/store/location/location.model';
import { Room } from 'src/app/store/room/room.model';
import { AssetDetails, AssetDetailsWithFields, AssetModalMode, AssetModalType } from '../../../../store/asset-details/asset-details.model';
import { AssetDetailsService } from '../../../../store/asset-details/asset-details.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetWithFields } from '../../../../store/asset/asset.model';
import { AssetInstantiationComponent } from '../asset-instantiation/asset-instantiation.component';

@Component({
  selector: 'app-assets-list',
  templateUrl: './assets-list.component.html',
  styleUrls: ['./assets-list.component.scss'],
  providers: [DialogService]
})
export class AssetsListComponent implements OnChanges, OnInit {
  @Input()
  company: Company;
  @Input()
  locations: Location[];
  @Input()
  location: Location;
  @Input()
  assetsWithDetailsAndFields: AssetDetailsWithFields[];
  @Input()
  rooms: Room[];
  @Input()
  allRoomsOfLocation: Room[];
  @Input()
  room: Room;
  @Output()
  selectedEvent = new EventEmitter<Set<ID>>();
  @Output()
  toolBarClickEvent = new EventEmitter<string>();
  @Output()
  assetDetailsSelected = new EventEmitter<AssetDetails>();
  @Output()
  updateAssetEvent = new EventEmitter<AssetDetails>();

  asset: AssetWithFields;
  assetDetailsForm: FormGroup;
  companyId: ID;
  ref: DynamicDialogRef;

  isLoading$: Observable<boolean>;
  selectedIds: Set<ID> = new Set();
  filterDict: { [key: string]: string[]; };
  assetsRoomIds: Set<ID> = new Set<ID>();
  assetRoomNamesAndIds: Set<[string, ID]> = new Set<[string, ID]>();
  assetsCategories: Set<string> = new Set<string>();
  assetsLocations: Set<string> = new Set<string>();
  assetsManufacturers: Set<string> = new Set<string>();
  moveAssetModal = false;

  assetsMapping:
    { [k: string]: string } = { '=0': 'No assets', '=1': '# Asset', other: '# Assets' };

  editBarMapping:
    { [k: string]: string } = {
      '=0': 'No assets selected',
      '=1': '# Asset selected',
      other: '# Assets selected'
    };

  constructor(
    private assetService: AssetService,
    private assetDetailsService: AssetDetailsService,
    private routingLocation: loc,
    private formBuilder: FormBuilder,
    public dialogService: DialogService) {
      this.createDetailsAssetForm(this.formBuilder);
  }

  ngOnInit() {
    this.createDetailsAssetForm(this.formBuilder);
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.rooms || changes.assetsWithDetailsAndFields) && this.assetsWithDetailsAndFields && this.rooms) {
      this.assetsWithDetailsAndFields.forEach(assetDetails => {
        this.assetsCategories.add(assetDetails.category);
        this.assetsLocations.add(assetDetails.locationName);
        this.assetsManufacturers.add(assetDetails.manufacturer);
        if (!this.containsId(assetDetails.roomId)) {
          this.assetsRoomIds.add(assetDetails.roomId);
          this.assetRoomNamesAndIds.add([assetDetails.roomName, assetDetails.roomId]);
        }
      });
    }
  }

  showOnboardDialog() {
    const ref = this.dialogService.open(AssetInstantiationComponent, {
      data: {
        assetDetailsForm: this.assetDetailsForm,
        assetsToBeOnboarded: this.assetsWithDetailsAndFields,
        locations: this.locations,
        rooms: this.rooms,
        activeModalType: AssetModalType.startInitialization,
        activeModalMode: AssetModalMode.onboardAssetMode
      },
    });

    ref.onClose.subscribe((assetFormValues: AssetDetails) => {
      if (assetFormValues) {
        this.assetUpdated(assetFormValues);
      }
    });
  }

  createDetailsAssetForm(formBuilder: FormBuilder) {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    this.assetDetailsForm = formBuilder.group({
      id: [null],
      roomId: ['', requiredTextValidator],
      name: ['', requiredTextValidator],
      description: [''],
      imageKey: [''],
      manufacturer: ['', requiredTextValidator],
      assetSeriesName: ['', requiredTextValidator],
      category: ['', requiredTextValidator],
      roomName: ['', requiredTextValidator],
      locationName: ['', requiredTextValidator]
    });
  }

  containsId(roomId: ID) {
    let containsId = false;
    this.assetsRoomIds.forEach(assetsRoomId => {
      if (roomId === assetsRoomId) {
        containsId = true;
      }
    });
    return containsId;
  }

  assetUpdated(asset: AssetDetails): void {
    console.log(asset);
    this.updateAssetEvent.emit(asset);
  }

  isSelected(id: ID) {
    return this.selectedIds.has(id);
  }

  onAssetSelect(asset: AssetDetailsWithFields) {
    this.selectedIds.add(asset.id);
    this.emitSelectEvent();
  }

  onAssetDeselect(asset: AssetDetailsWithFields) {
    this.selectedIds.delete(asset.id);
    this.emitSelectEvent();
  }

  unselect() {
    this.selectedIds.clear();
  }

  emitSelectEvent() {
    this.selectedEvent.emit(this.selectedIds);
  }

  onFilter(filterDict: { [key: string]: string[]; }) {
    this.filterDict = Object.assign({ }, filterDict);
    console.log(this.filterDict);
  }

  assignAsset(room: Room, asset: AssetDetailsWithFields) {
    if ((!this.company) || (!this.location)) { return; }
    this.assetService.assignAssetToRoom(this.company.id, this.location.id, room.id, asset.roomId, asset.id)
      .subscribe(
        nextAsset => console.log('Asset with id: ' + nextAsset.id + ' reassigned to room ' + room.name),
        error => console.log(error)
      );
    this.assetDetailsService.updateRoom(asset.id, room.id);
    this.moveAssetModal = false;
  }

  goBack() {
    this.routingLocation.back();
  }

  getRoomsLink() {
    if (this.room) {
      return ['..'];
    } else {
      return ['rooms'];
    }
  }

  onCardsViewClick() {
    this.toolBarClickEvent.emit('GRID');
  }


  deleteAsset(event: AssetDetailsWithFields) {
    this.assetService.removeCompanyAsset(event.companyId, event.id).subscribe(() => {
      this.assetsWithDetailsAndFields.splice(this.assetsWithDetailsAndFields.indexOf(event), 1);
    });
    console.log(event);
  }
}

export class FilterOptions {
  filterAttribute: string;
  filterFields: string[];
}
