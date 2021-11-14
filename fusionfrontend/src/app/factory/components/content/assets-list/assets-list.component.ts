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

import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { AssetService } from 'src/app/store/asset/asset.service';
import { Company } from 'src/app/store/company/company.model';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { Room } from 'src/app/store/room/room.model';
import {
  AssetModalMode,
  AssetModalType,
  FactoryAssetDetails,
  FactoryAssetDetailsWithFields
} from '../../../../store/factory-asset-details/factory-asset-details.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormGroup } from '@angular/forms';
import { Asset, AssetWithFields } from '../../../../store/asset/asset.model';
import { AssetInstantiationComponent } from '../asset-instantiation/asset-instantiation.component';
import { ConfirmationService, SortEvent, TreeNode } from 'primeng/api';
import { FilterOption, FilterType } from '../../../../components/ui/table-filter/filter-options';
import { ItemOptionsMenuType } from 'src/app/components/ui/item-options-menu/item-options-menu.type';
import { TableSelectedItemsBarType } from '../../../../components/ui/table-selected-items-bar/table-selected-items-bar.type';
import { OispAlert, OispAlertPriority } from '../../../../store/oisp/oisp-alert/oisp-alert.model';
import { faExclamationCircle, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { AssetDetailMenuService } from '../../../../services/menu/asset-detail-menu.service';
import { TableHelper } from '../../../../common/utils/table-helper';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteHelpers } from '../../../../common/utils/route-helpers';
import { StatusWithAssetId } from '../../../models/status.model';

@Component({
  selector: 'app-assets-list',
  templateUrl: './assets-list.component.html',
  styleUrls: ['./assets-list.component.scss'],
  providers: [DialogService, ConfirmationService]
})
export class AssetsListComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  company: Company;
  @Input()
  factorySites: FactorySite[];
  @Input()
  factorySite: FactorySite;
  @Input()
  factoryAssetsDetailsWithFields: FactoryAssetDetailsWithFields[];
  @Input()
  rooms: Room[];
  @Input()
  allRoomsOfFactorySite: Room[];
  @Input()
  room: Room;
  @Input()
  factoryAssetStatuses: StatusWithAssetId[] = [];
  @Output()
  selectedEvent = new EventEmitter<ID[]>();
  @Output()
  toolBarClickEvent = new EventEmitter<string>();
  @Output()
  updateAssetEvent = new EventEmitter<[Room, FactoryAssetDetails]>();

  rowsPerPageOptions: number[] = TableHelper.rowsPerPageOptions;
  rowCount = TableHelper.defaultRowCount;

  faInfoCircle = faInfoCircle;
  faExclamationCircle = faExclamationCircle;
  faExclamationTriangle = faExclamationTriangle;
  OispPriority = OispAlertPriority;

  treeData: Array<TreeNode<FactoryAssetDetailsWithFields>> = [];
  selectedFactoryAssets: Array<TreeNode<FactoryAssetDetailsWithFields>> = [];
  displayedFactoryAssets: FactoryAssetDetailsWithFields[];
  filteredFactoryAssets: FactoryAssetDetailsWithFields[];
  searchedFactoryAssets: FactoryAssetDetailsWithFields[];
  factoryAssetFilteredByStatus: FactoryAssetDetailsWithFields[];
  activeListItem: FactoryAssetDetailsWithFields;

  isLoading$: Observable<boolean>;
  asset: AssetWithFields;
  assetDetailsForm: FormGroup;
  companyId: ID;

  statusType: ID;

  private onboardingDialogRef: DynamicDialogRef;

  titleMapping:
    { [k: string]: string } = { '=0': 'No assets', '=1': '# Asset', other: '# Assets' };

  ItemOptionsMenuType = ItemOptionsMenuType;
  TableSelectedItemsBarType = TableSelectedItemsBarType;

  tableFilters: FilterOption[] = [{ filterType: FilterType.DROPDOWNFILTER, columnName: 'Category', attributeToBeFiltered: 'category' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Manufacturer', attributeToBeFiltered: 'manufacturer' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Room', attributeToBeFiltered: 'roomName' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Factory Site', attributeToBeFiltered: 'factorySiteName'},
    { filterType: FilterType.STATUSFILTER, columnName: 'Status', attributeToBeFiltered: 'status'}];

  constructor(
    private assetService: AssetService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private assetDetailMenuService: AssetDetailMenuService) {
  }

  ngOnInit() {
    this.assetDetailsForm = this.assetDetailMenuService.createAssetDetailsForm();
    this.rowCount = TableHelper.getValidRowCountFromUrl(this.rowCount, this.activatedRoute.snapshot, this.router);
    this.statusType =  RouteHelpers.findParamInFullActivatedRoute(this.activatedRoute.snapshot, 'statusType');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.factoryAssetsDetailsWithFields) {
      this.displayedFactoryAssets = this.factoryAssetFilteredByStatus = this.searchedFactoryAssets = this.filteredFactoryAssets
        = this.factoryAssetsDetailsWithFields;
    }

    if (this.statusType !== null && this.factoryAssetsDetailsWithFields !== null && this.factoryAssetStatuses !== null) {
      this.factoryAssetFilteredByStatus = this.factoryAssetsDetailsWithFields.filter(asset => {
        return this.factoryAssetStatuses.filter(factoryAssetStatus => factoryAssetStatus.status.statusValue === null ?
          String(this.statusType) === '0' : String(factoryAssetStatus.status.statusValue) === String(this.statusType))
          .map(factoryAssetStatusWithId => factoryAssetStatusWithId.factoryAssetId).includes(asset.id);
      });
    }
    if (this.filteredFactoryAssets !== null) {
      this.updateAssets();
    }
  }

  ngOnDestroy() {
    if (this.onboardingDialogRef) {
      this.onboardingDialogRef.close();
    }
  }

  setActiveRow(asset?) {
    if (asset) {
      this.activeListItem = asset;
    } else {
      this.activeListItem = this.selectedFactoryAssets[0].data;
    }
  }

  searchAssets(event: FactoryAssetDetailsWithFields[]): void {
    this.searchedFactoryAssets = event;
    this.updateAssets();
  }

  filterAssets(event?: FactoryAssetDetailsWithFields[]) {
    this.filteredFactoryAssets = event;
    this.updateAssets();
  }

  public getMaxOpenAlertPriority(node: TreeNode<FactoryAssetDetailsWithFields>): OispAlertPriority {
    let openAlertPriority = node.data?.openAlertPriority;
    if (!node.expanded && node.children?.length > 0) {
      for (const child of node.children) {
        const childMaxOpenAlertPriority: OispAlertPriority = this.getMaxOpenAlertPriority(child);
        if (!openAlertPriority ||
          OispAlert.getPriorityAsNumber(openAlertPriority) > OispAlert.getPriorityAsNumber(childMaxOpenAlertPriority)) {
          openAlertPriority = childMaxOpenAlertPriority;
        }
      }
    }
    return openAlertPriority;
  }

  isLastChildElement(rowNode: any): boolean {
    const subsystemIds = rowNode.parent?.data.subsystemIds;
    if (subsystemIds) {
      const index = subsystemIds.findIndex((value) => value === rowNode.node.data.id);
      return index === subsystemIds.length - 1;
    } else {
      return false;
    }
  }

  showOnboardDialog() {
    this.onboardingDialogRef = this.dialogService.open(AssetInstantiationComponent, {
      data: {
        assetDetailsForm: this.assetDetailsForm,
        assetsToBeOnboarded: this.factoryAssetsDetailsWithFields,
        factorySites: this.factorySites,
        rooms: this.rooms,
        activeModalType: AssetModalType.startInitialization,
        activeModalMode: AssetModalMode.onboardAssetMode
      },
      header: 'Select Asset for Onboarding',
      width: '70%',
      contentStyle: { 'padding-left': '6%', 'padding-right': '6%', 'padding-top': '1.5%' },
    });

    this.onboardingDialogRef.onClose.subscribe((assetFormValues: FactoryAssetDetails) => {
      if (assetFormValues) {
        this.assetUpdated(assetFormValues);
      }
    });
  }

  assetUpdated(newAssetDetails: FactoryAssetDetails): void {
    const oldRoom = this.getOldRoomForAsset(newAssetDetails);
    this.updateAssetEvent.emit([oldRoom, newAssetDetails]);
  }

  getOldRoomForAsset(updatedAsset) {
    const roomId = this.factoryAssetsDetailsWithFields.filter(asset => asset.id === updatedAsset.id).pop().roomId;
    return this.rooms.filter(room => room.id === roomId).pop();
  }

  onCardsViewClick() {
    const selectedFactoryAssetIds = this.selectedFactoryAssets.map(asset => asset.data.id);
    this.selectedEvent.emit(selectedFactoryAssetIds);
    this.toolBarClickEvent.emit('GRID');
  }

  deleteAsset() {
    this.assetService.removeCompanyAsset(this.activeListItem.companyId, this.activeListItem.id).subscribe(() => {
      this.factoryAssetsDetailsWithFields.splice(this.factoryAssetsDetailsWithFields.indexOf(this.activeListItem), 1);
    });
  }

  openEditDialog() {
    this.assetDetailMenuService.showEditDialog(this.activeListItem, this.factorySite, this.factorySites, this.rooms,
      () => this.deselectAllItems(), (details) => this.assetUpdated(details));
  }

  openDeleteDialog() {
    this.assetDetailMenuService.showDeleteDialog(this.confirmationService, 'asset-delete-dialog-list',
      this.activeListItem.name, () => this.deleteAsset());
  }

  openAssignRoomDialog() {
    if (this.factorySite) {
      this.showAssignRoomDialog(AssetModalType.roomAssignment, AssetModalMode.editRoomWithPreselecedFactorySiteMode,
        `Room Assignment (${this.factorySite.name})`);
    } else {
      this.showAssignRoomDialog(AssetModalType.factorySiteAssignment, AssetModalMode.editRoomForAssetMode,
        'Factory Site Assignment');
    }
  }

  deselectAllItems(): void {
    this.selectedFactoryAssets = [];
  }

  getAssetLink(asset: Asset) {
    return ['/factorymanager', 'companies', asset.companyId, 'assets', asset.id];
  }

  private showAssignRoomDialog(modalType: AssetModalType, modalMode: AssetModalMode, header: string) {
    this.assetDetailMenuService.showAssignRoomDialog(this.activeListItem, this.factorySite, this.factorySites,
      this.rooms, modalType, modalMode, header, (details) => this.assetUpdated(details));
  }

  private updateAssets(): void {
    this.displayedFactoryAssets = this.factoryAssetsDetailsWithFields.filter(asset => this.searchedFactoryAssets
      .filter(searchedAsset => this.filteredFactoryAssets.filter(filteredAsset => this.factoryAssetFilteredByStatus
        .includes(filteredAsset)).includes(searchedAsset)).includes(asset));
    this.updateTree();
  }

  private updateTree() {
    if (this.displayedFactoryAssets) {
      const subsystemIDs = this.displayedFactoryAssets.map(asset => asset.subsystemIds);
      const flattenedSubsystemIDs = subsystemIDs.reduce((acc, val) => acc.concat(val), []);
      const treeData: TreeNode<FactoryAssetDetailsWithFields>[] = [];
      this.displayedFactoryAssets
        .filter(asset => !flattenedSubsystemIDs.includes(asset.id))
        .forEach((value: FactoryAssetDetailsWithFields) => {
          treeData.push(this.addNode(null, value));
        });
      treeData.forEach(node => {
        this.expandChildren(node);
      });
      this.treeData = treeData;
    }
  }

  private expandChildren(node: TreeNode) {
    if (node.children) {
      node.expanded = true;
      for (const cn of node.children) {
        this.expandChildren(cn);
      }
    }
  }

  private addNode(parent: TreeNode<FactoryAssetDetailsWithFields>,
                  value: FactoryAssetDetailsWithFields): TreeNode<FactoryAssetDetailsWithFields> {
    const treeNode: TreeNode<FactoryAssetDetailsWithFields> = {
      data: value,
      parent,
    };
    if (value.subsystemIds?.length > 0) {
      const children: TreeNode<FactoryAssetDetailsWithFields>[] = [];
      value.subsystemIds.forEach(id => {
        const subsystem = this.factoryAssetsDetailsWithFields.find(asset => asset.id === id);
        if (subsystem) {
          children.push(this.addNode(treeNode, subsystem));
        }
      });
      treeNode.children = children;
    }
    return treeNode;
  }

  updateRowCountInUrl(rowCount: number): void {
    this.rowCount = rowCount;
    TableHelper.updateRowCountInUrl(rowCount, this.router);
  }

  customSort(event: SortEvent) {
    const status = 'status';

    event.data.sort((data1, data2) => {
      let value1;
      let value2;
      let result;
      if (event.field === status) {
        value1 = this.factoryAssetStatuses.find(factoryAssetStatus =>
          factoryAssetStatus.factoryAssetId === data1.data.id).status.statusValue;
        value2 = this.factoryAssetStatuses.find(factoryAssetStatus =>
          factoryAssetStatus.factoryAssetId === data2.data.id).status.statusValue;
      } else {
        value1 = data1.data[event.field];
        value2 = data2.data[event.field];
      }

      if (value1 == null && value2 != null) {
        result = -1;
      } else if (value1 != null && value2 == null) {
        result = 1;
      } else if (value1 == null && value2 == null) {
        result = 0;
      } else if (typeof value1 === 'string' && typeof value2 === 'string') {
        result = value1.localeCompare(value2);
      } else {
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
      }
      return (event.order * result);
    });
  }

}
