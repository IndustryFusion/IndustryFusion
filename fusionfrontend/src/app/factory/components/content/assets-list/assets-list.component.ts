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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { AssetService } from 'src/app/store/asset/asset.service';
import { Company } from 'src/app/store/company/company.model';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { Room } from 'src/app/store/room/room.model';
import {
  AssetDetails,
  AssetDetailsWithFields,
  AssetModalMode,
  AssetModalType
} from '../../../../store/asset-details/asset-details.model';
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
export class AssetsListComponent implements OnInit {
  @Input()
  company: Company;
  @Input()
  factorySites: FactorySite[];
  @Input()
  factorySite: FactorySite;
  @Input()
  assetsWithDetailsAndFields: AssetDetailsWithFields[];
  @Input()
  rooms: Room[];
  @Input()
  allRoomsOfFactorySite: Room[];
  @Input()
  room: Room;
  @Output()
  selectedEvent = new EventEmitter<Set<ID>>();
  @Output()
  toolBarClickEvent = new EventEmitter<string>();
  @Output()
  assetDetailsSelected = new EventEmitter<AssetDetails>();
  @Output()
  updateAssetEvent = new EventEmitter<[Room, AssetDetails]>();

  asset: AssetWithFields;
  assetDetailsForm: FormGroup;
  companyId: ID;
  ref: DynamicDialogRef;

  isLoading$: Observable<boolean>;
  selectedIds: Set<ID> = new Set();
  filterDict: { [key: string]: string[]; };

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
    private formBuilder: FormBuilder,
    public dialogService: DialogService) {
      this.createDetailsAssetForm(this.formBuilder);
  }

  ngOnInit() {
    this.createDetailsAssetForm(this.formBuilder);
  }

  showOnboardDialog() {
    const ref = this.dialogService.open(AssetInstantiationComponent, {
      data: {
        assetDetailsForm: this.assetDetailsForm,
        assetsToBeOnboarded: this.assetsWithDetailsAndFields,
        factorySites: this.factorySites,
        rooms: this.rooms,
        activeModalType: AssetModalType.startInitialization,
        activeModalMode: AssetModalMode.onboardAssetMode
      },
      header: 'Select Asset for Onboarding',
      width: '70%',
      contentStyle: { 'padding-left': '6%', 'padding-right': '6%', 'padding-top': '1.5%' },
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
      factorySiteName: ['', requiredTextValidator]
    });
  }

  assetUpdated(newAssetDetails: AssetDetails): void {
    const oldRoom = this.getOldRoomForAsset(newAssetDetails);
    this.updateAssetEvent.emit([oldRoom, newAssetDetails]);
  }

  getOldRoomForAsset(updatedAsset) {
    const roomId = this.assetsWithDetailsAndFields.filter(asset => asset.id === updatedAsset.id).pop().roomId;
    return this.rooms.filter(room => room.id === roomId).pop();
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
  }
}

export class FilterOptions {
  filterAttribute: string;
  filterFields: string[];
}
