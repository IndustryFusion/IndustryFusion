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
import { FactoryAssetDetails, FactoryAssetDetailsWithFields, AssetModalMode, AssetModalType } from '../../../../store/factory-asset-details/factory-asset-details.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Asset, AssetWithFields } from '../../../../store/asset/asset.model';
import { AssetInstantiationComponent } from '../asset-instantiation/asset-instantiation.component';
import { Location } from '@angular/common';
import { WizardHelper } from '../../../../common/utils/wizard-helper';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { FilterOption, FilterType } from '../../../../components/ui/table-filter/filter-options';
import { faTimes, faWrench, faThLarge, faReply, faHome } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle, faTrashAlt } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-assets-list',
  templateUrl: './assets-list.component.html',
  styleUrls: ['./assets-list.component.scss'],
  providers: [DialogService, ConfirmationService]
})
export class AssetsListComponent implements OnInit {
  @Input()
  company: Company;
  @Input()
  factorySites: FactorySite[];
  @Input()
  factorySite: FactorySite;
  @Input()
  factoryAssetDetailsWithFields: FactoryAssetDetailsWithFields[];
  @Input()
  rooms: Room[];
  @Input()
  allRoomsOfFactorySite: Room[];
  @Input()
  room: Room;
  @Output()
  selectedEvent = new EventEmitter<ID[]>();
  @Output()
  toolBarClickEvent = new EventEmitter<string>();
  @Output()
  updateAssetEvent = new EventEmitter<[Room, FactoryAssetDetails]>();

  displayedFactoryAssets: FactoryAssetDetailsWithFields[];
  filteredFactoryAssets: FactoryAssetDetailsWithFields[];
  searchedFactoryAssets: FactoryAssetDetailsWithFields[];
  selectedFactoryAssets: FactoryAssetDetailsWithFields[] = [];
  menuActions: MenuItem[];
  activeListItem: FactoryAssetDetailsWithFields;
  faTimes = faTimes;
  faWrench = faWrench;
  faThLarge = faThLarge;
  faCheckCircle = faCheckCircle;
  faTrashAlt = faTrashAlt;
  faReply = faReply;
  faHome = faHome;
  shouldShowDeleteItem = false;


  asset: AssetWithFields;
  assetDetailsForm: FormGroup;
  companyId: ID;
  ref: DynamicDialogRef;

  isLoading$: Observable<boolean>;

  titleMapping:
    { [k: string]: string } = { '=0': 'No assets', '=1': '# Asset', other: '# Assets' };

  editBarMapping:
    { [k: string]: string } = {
      '=0': 'No assets selected',
      '=1': '# Asset selected',
      other: '# Assets selected'
    };

  possibleFilters: FilterOption[] = [{ filterType: FilterType.DROPDOWNFILTER, columnName: 'Category', attributeToBeFiltered: 'category' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Manufacturer', attributeToBeFiltered: 'manufacturer' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Room', attributeToBeFiltered: 'roomName' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Factory Site', attributeToBeFiltered: 'factorySiteName'}];

  constructor(
    private assetService: AssetService,
    private formBuilder: FormBuilder,
    public dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private routingLocation: Location) {
      this.createDetailsAssetForm(this.formBuilder);
  }

  ngOnInit() {
    this.displayedFactoryAssets = this.factoryAssetDetailsWithFields;
    this.createDetailsAssetForm(this.formBuilder);
    this.menuActions = [{ label: 'Edit item', icon: 'pi pi-fw pi-pencil', command: (_) => { this.showEditDialog(); } },
      { label: 'Assign Asset to room', icon: 'pi pw-fw pi-sign-in', command: (_) => { this.openAssignRoomDialog(); } },
      { label: 'Delete', icon: 'pi pw-fw pi-trash', command: (_) => { this.showDeleteDialog(); } }];
  }

  ngOnChanges(): void {
    this.displayedFactoryAssets = this.searchedFactoryAssets = this.filteredFactoryAssets = this.factoryAssetDetailsWithFields;
  }

  setActiveRow(asset?) {
    if (asset) {
      this.activeListItem = asset;
    } else {
      this.activeListItem = this.selectedFactoryAssets[0];
    }
  }

  showOnboardDialog() {
    const ref = this.dialogService.open(AssetInstantiationComponent, {
      data: {
        assetDetailsForm: this.assetDetailsForm,
        assetsToBeOnboarded: this.factoryAssetDetailsWithFields,
        factorySites: this.factorySites,
        rooms: this.rooms,
        activeModalType: AssetModalType.startInitialization,
        activeModalMode: AssetModalMode.onboardAssetMode
      },
      header: 'Select Asset for Onboarding',
      width: '70%',
      contentStyle: { 'padding-left': '6%', 'padding-right': '6%', 'padding-top': '1.5%' },
    });

    ref.onClose.subscribe((assetFormValues: FactoryAssetDetails) => {
      if (assetFormValues) {
        this.assetUpdated(assetFormValues);
      }
    });
  }

  createDetailsAssetForm(formBuilder: FormBuilder, factoryAsset?: FactoryAssetDetailsWithFields) {
    this.assetDetailsForm = formBuilder.group({
      id: [null],
      roomId: ['', WizardHelper.requiredTextValidator],
      name: ['', WizardHelper.requiredTextValidator],
      description: [''],
      imageKey: [''],
      manufacturer: ['', WizardHelper.requiredTextValidator],
      assetSeriesName: ['', WizardHelper.requiredTextValidator],
      category: ['', WizardHelper.requiredTextValidator],
      roomName: ['', WizardHelper.requiredTextValidator],
      factorySiteName: ['', WizardHelper.requiredTextValidator]
    });
    if (factoryAsset) {
      this.assetDetailsForm.patchValue(factoryAsset);
    }
  }

  assetUpdated(newAssetDetails: FactoryAssetDetails): void {
    const oldRoom = this.getOldRoomForAsset(newAssetDetails);
    this.updateAssetEvent.emit([oldRoom, newAssetDetails]);
  }

  getOldRoomForAsset(updatedAsset) {
    const roomId = this.factoryAssetDetailsWithFields.filter(asset => asset.id === updatedAsset.id).pop().roomId;
    return this.rooms.filter(room => room.id === roomId).pop();
  }

  getRoomsLink() {
    if (this.room) {
      return ['..'];
    } else {
      return ['rooms'];
    }
  }

  onCardsViewClick() {
    const selectedFactoryAssetIds = this.selectedFactoryAssets.map(asset => asset.id);
    this.selectedEvent.emit(selectedFactoryAssetIds);
    this.toolBarClickEvent.emit('GRID');
  }

  deleteAsset() {
    this.assetService.removeCompanyAsset(this.activeListItem.companyId, this.activeListItem.id).subscribe(() => {
      this.factoryAssetDetailsWithFields.splice(this.factoryAssetDetailsWithFields.indexOf(this.activeListItem), 1);
    });
  }

  goBack() {
    this.routingLocation.back();
  }

  searchAssets(event?): void {
    this.searchedFactoryAssets = event;
    this.updateAssets();
  }

  filterAssets(event?) {
    this.filteredFactoryAssets = event;
    this.updateAssets();
  }

  private updateAssets(): void {
    this.displayedFactoryAssets = this.factoryAssetDetailsWithFields;
    if (this.searchedFactoryAssets) {
      this.displayedFactoryAssets = this.filteredFactoryAssets.filter(notification =>
        this.searchedFactoryAssets.includes(notification));
    }
  }

  showEditDialog() {
    this.createDetailsAssetForm(this.formBuilder, this.activeListItem);
    const ref = this.dialogService.open(AssetInstantiationComponent, {
      data: {
        assetDetailsForm: this.assetDetailsForm,
        assetToBeEdited: this.activeListItem,
        factorySites: this.factorySites,
        factorySite: this.factorySite,
        rooms: this.rooms,
        activeModalType: AssetModalType.customizeAsset,
        activeModalMode: AssetModalMode.editAssetMode
      },
      header: 'General Information',
    });

    ref.onClose.subscribe((assetFormValues: FactoryAssetDetails) => {
      if (assetFormValues) {
        this.assetUpdated(assetFormValues);
      }
    });
  }

  openAssignRoomDialog() {
    if (this.factorySite) {
      this.showAssignRoomDialog(AssetModalType.roomAssignment, AssetModalMode.editRoomWithPreselecedFactorySiteMode,
        'Room Assignment (' + this.factorySite.name + ')');
    } else {
      this.showAssignRoomDialog(AssetModalType.factorySiteAssignment, AssetModalMode.editRoomForAssetMode,
        'Factory Site Assignment');
    }
  }

  showAssignRoomDialog(assetModalType: AssetModalType, assetModalMode: AssetModalMode, header: string) {
    this.createDetailsAssetForm(this.formBuilder, this.activeListItem);
    const ref = this.dialogService.open(AssetInstantiationComponent, {
      data: {
        assetDetailsForm: this.assetDetailsForm,
        assetToBeEdited: this.activeListItem,
        factorySites: this.factorySites,
        factorySite: this.factorySite,
        rooms: this.rooms,
        activeModalType: assetModalType,
        activeModalMode: assetModalMode
      },
      header
    });

    ref.onClose.subscribe((newAssetDetails: FactoryAssetDetails) => {
      if (newAssetDetails) {
        this.assetUpdated(newAssetDetails);
      }
    });
  }

  deselectAllItems(): void {
    this.selectedFactoryAssets = [];
  }

  getAssetLink(asset: Asset) {
    return ['/factorymanager', 'companies', asset.companyId, 'assets', asset.id];
  }

  showDeleteDialog() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the asset ' + this.activeListItem.name + '?',
      header: 'Delete Asset Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteAsset();
      },
      reject: () => {
      }
    });
  }
}

export class FilterOptions {
  filterAttribute: string;
  filterFields: string[];
}
