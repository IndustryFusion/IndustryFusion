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
import { AssetService } from 'src/app/core/store/asset/asset.service';
import { Company } from 'src/app/core/store/company/company.model';
import { FactorySite } from 'src/app/core/store/factory-site/factory-site.model';
import { Room } from 'src/app/core/store/room/room.model';
import {
  AssetModalMode,
  AssetModalType,
  FactoryAssetDetails,
  FactoryAssetDetailsWithFields
} from '../../../../core/store/factory-asset-details/factory-asset-details.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormGroup } from '@angular/forms';
import { Asset } from '../../../../core/store/asset/asset.model';
import { AssetInstantiationComponent } from '../asset-instantiation/asset-instantiation.component';
import { ConfirmationService, SortEvent, TreeNode } from 'primeng/api';
import { FilterOption, FilterType } from '../../../../shared/components/ui/table-filter/filter-options';
import { ItemOptionsMenuType } from 'src/app/shared/components/ui/item-options-menu/item-options-menu.type';
import {
  TableSelectedItemsBarType
} from '../../../../shared/components/ui/table-selected-items-bar/table-selected-items-bar.type';
import { faExclamationCircle, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FactoryAssetDetailMenuService } from '../../../../core/services/menu/factory-asset-detail-menu.service';
import { TableHelper } from '../../../../core/helpers/table-helper';
import { ActivatedRoute, Router } from '@angular/router';
import { Status, StatusWithAssetId } from '../../../models/status.model';
import { TranslateService } from '@ngx-translate/core';
import { Field, FieldOption } from '../../../../core/store/field/field.model';
import { GroupByHelper, RowGroupCount } from '../../../../core/helpers/group-by-helper';
import { RouteHelpers } from '../../../../core/helpers/route-helpers';
import { StatusWithAssetId } from '../../../models/status.model';
import { IFAlertSeverity } from '../../../../core/store/oisp/alerta-alert/alerta-alert.model';
import { AlertaAlertQuery } from '../../../../core/store/oisp/alerta-alert/alerta-alert.query';
import { IfApiService } from '../../../../core/services/api/if-api.service';
import { AssetListType } from '../../../../shared/models/asset-list-type.model';

@Component({
  selector: 'app-assets-list',
  templateUrl: './assets-list.component.html',
  styleUrls: ['./assets-list.component.scss'],
  providers: [DialogService, ConfirmationService]
})

export class AssetsListComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  type: AssetListType = AssetListType.ASSETS;
  AssetListType = AssetListType;

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
  @Input()
  factoryAssetStatuses: StatusWithAssetId[] = [];
  @Input()
  fields: Field[];
  @Output()
  selectedEvent = new EventEmitter<ID[]>();
  @Output()
  toolBarClickEvent = new EventEmitter<string>();
  @Output()
  updateAssetEvent = new EventEmitter<[Room, FactoryAssetDetails]>();

  rowsPerPageOptions: number[] = TableHelper.rowsPerPageOptions;
  rowCount = TableHelper.defaultRowCount;

  treeData: Array<TreeNode<FactoryAssetDetailsWithFields>> = [];
  selectedFactoryAssets: Array<TreeNode<FactoryAssetDetailsWithFields>> = [];
  displayedFactoryAssets: FactoryAssetDetailsWithFields[];

  searchText = '';
  groupByActive = false;
  selectedEnum: FieldOption;
  selectedEnumOptions: FieldOption[];
  tableFilters: FilterOption[];
  rowGroupMetaDataMap: Map<ID, RowGroupCount>;

  titleMapping:
    { [k: string]: string } = { '=0': this.translate.instant('APP.FACTORY.ASSETS_LIST.NO_ASSETS'),
    '=1': '# ' + this.translate.instant('APP.COMMON.TERMS.ASSET'), other: '# ' + this.translate.instant('APP.COMMON.TERMS.ASSETS') };

  GroupByHelper = GroupByHelper;
  faInfoCircle = faInfoCircle;
  faExclamationCircle = faExclamationCircle;
  faExclamationTriangle = faExclamationTriangle;
  ItemOptionsMenuType = ItemOptionsMenuType;
  TableSelectedItemsBarType = TableSelectedItemsBarType;

  private assetDetailsForm: FormGroup;
  private onboardingDialogRef: DynamicDialogRef;
  private filteredFactoryAssets: FactoryAssetDetailsWithFields[];
  private searchedFactoryAssets: FactoryAssetDetailsWithFields[];
  private activeListItem: FactoryAssetDetailsWithFields;


  constructor(
    private assetService: AssetService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alertaAlertQuery: AlertaAlertQuery,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private assetDetailMenuService: AssetDetailMenuService,
    public ifApiService: IfApiService,
    private assetDetailMenuService: FactoryAssetDetailMenuService,
    public translate: TranslateService) {
  }

  private static refreshPage(): void {
    window.location.reload();
  }

  ngOnInit() {
    this.initTableFilters();
    this.assetDetailsForm = this.assetDetailMenuService.createAssetDetailsForm();
    this.rowCount = TableHelper.getValidRowCountFromUrl(this.rowCount, this.activatedRoute.snapshot, this.router);
    this.statusType =  RouteHelpers.findParamInFullActivatedRoute(this.activatedRoute.snapshot, 'statusType');

    if (this.type === AssetListType.SUBSYSTEMS) {
      this.titleMapping = { '=0': 'No subsystems', '=1': '# Subsystem', other: '# Subsystems' };
    }
  }

  private initTableFilters(): void {
    this.tableFilters = [{ filterType: FilterType.DROPDOWNFILTER, columnName: this.translate.instant('APP.FACTORY.ASSETS_LIST.CATEGORY'),
        attributeToBeFiltered: 'category' },
      { filterType: FilterType.DROPDOWNFILTER, columnName: this.translate.instant('APP.COMMON.TERMS.MANUFACTURER'),
        attributeToBeFiltered: 'manufacturer' },
      { filterType: FilterType.DROPDOWNFILTER, columnName: this.translate.instant('APP.COMMON.TERMS.ROOM'),
        attributeToBeFiltered: 'roomName' },
      { filterType: FilterType.DROPDOWNFILTER, columnName: this.translate.instant('APP.COMMON.TERMS.FACTORY_SITE'),
        attributeToBeFiltered: 'factorySiteName'},
      { filterType: FilterType.STATUSFILTER, columnName: this.translate.instant('APP.COMMON.TERMS.STATUS'),
        attributeToBeFiltered: 'status'}
    ];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.factoryAssetDetailsWithFields) {
      this.displayedFactoryAssets = this.searchedFactoryAssets = this.filteredFactoryAssets = this.factoryAssetDetailsWithFields;
      this.updateDisplayedAssets();
    }
  }

  ngOnDestroy() {
    if (this.onboardingDialogRef) {
      this.onboardingDialogRef.close();
    }
  }

  setActiveRow(asset?: FactoryAssetDetailsWithFields): void {
    if (asset) {
      this.activeListItem = asset;
    } else {
      this.activeListItem = this.selectedFactoryAssets[0].data;
    }
  }

  searchAssets(factoryAssetsSearchedByName: FactoryAssetDetailsWithFields[]): void {
    this.searchedFactoryAssets = factoryAssetsSearchedByName;
    this.updateDisplayedAssets();
  }

  setSearchText(searchText: string): void {
    this.searchText = searchText;
  }

  filterAssets(filteredFactoryAssets?: FactoryAssetDetailsWithFields[]): void {
    this.filteredFactoryAssets = filteredFactoryAssets;
    this.updateDisplayedAssets();
  }

  groupAssets(selectedFieldOption: FieldOption): void {
    this.selectedEnum = selectedFieldOption;
    this.groupByActive = this.selectedEnum != null;
    if (this.selectedEnum) {
      this.selectedEnumOptions = this.fields.filter(field => field.id === this.selectedEnum.fieldId).pop().enumOptions;
      this.rowGroupMetaDataMap = GroupByHelper.updateRowGroupMetaData(this.displayedFactoryAssets, this.selectedEnum);
    }
  }

  hasSelectedEnumValue(asset: FactoryAssetDetailsWithFields): number {
    return GroupByHelper.getFieldIndexOfSelectedEnum(asset, this.selectedEnum);
  }

  public getMaxOpenAlertSeverity(node: TreeNode<FactoryAssetDetailsWithFields>): IFAlertSeverity {
    return this.alertaAlertQuery.getMostCriticalOpenAlertSeverityOfAssetNode(node);
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

  showOnboardDialog(): void {
    this.onboardingDialogRef = this.dialogService.open(AssetInstantiationComponent, {
      data: {
        assetDetailsForm: this.assetDetailsForm,
        assetsToBeOnboarded: this.factoryAssetDetailsWithFields,
        factorySites: this.factorySites,
        rooms: this.rooms,
        activeModalType: AssetModalType.startInitialization,
        activeModalMode: AssetModalMode.onboardAssetMode
      },
      header: this.translate.instant('APP.FACTORY.ASSETS_LIST.DIALOG_HEADING.ON_BOARDING'),
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

  private getOldRoomForAsset(updatedAsset: FactoryAssetDetails): Room {
    const roomId = this.factoryAssetDetailsWithFields.filter(asset => asset.id === updatedAsset.id).pop().roomId;
    return this.rooms.filter(room => room.id === roomId).pop();
  }

  onCardsViewClick(): void {
    const selectedFactoryAssetIds = this.selectedFactoryAssets.map(asset => asset.data.id);
    this.selectedEvent.emit(selectedFactoryAssetIds);
    this.toolBarClickEvent.emit('GRID');
  }

  openEditDialog(): void {
    this.assetDetailMenuService.showEditWizard(this.activeListItem, this.factorySite, this.factorySites, this.rooms,
      () => this.deselectAllItems(), (details) => this.assetUpdated(details));
  }

  openDeleteDialog(): void {
    this.assetDetailMenuService.showDeleteDialog('asset-delete-dialog-list', this.activeListItem.name,
      () => this.deleteAsset());
  }

  private deleteAsset(): void {
    this.assetService.removeCompanyAsset(this.activeListItem.companyId, this.activeListItem.id).subscribe(() => {
      this.factoryAssetDetailsWithFields.splice(this.factoryAssetDetailsWithFields.indexOf(this.activeListItem), 1);
    });
  }

  openAssignRoomDialog(): void {
    if (this.factorySite) {
      this.showAssignRoomDialog(AssetModalType.roomAssignment, AssetModalMode.editRoomWithPreselectedFactorySiteMode,
        this.translate.instant('APP.FACTORY.ASSETS_LIST.DIALOG_HEADING.ROOM_ASSIGNMENT')` (${this.factorySite.name})`);
    } else {
      this.showAssignRoomDialog(AssetModalType.factorySiteAssignment, AssetModalMode.editRoomForAssetMode,
        this.translate.instant('APP.FACTORY.ASSETS_LIST.DIALOG_HEADING.FACTORY_SITE_ASSIGNMENT'));
    }
  }

  deselectAllItems(): void {
    this.selectedFactoryAssets = [];
  }

  getAssetLink(asset: Asset) {
    return ['/factorymanager', 'companies', asset.companyId, 'assets', asset.id];
  }

  getStatus(assetDetails: FactoryAssetDetails): Status {
    return this.factoryAssetStatuses?.find(x => x.factoryAssetId === assetDetails.id)?.status;
  }

  private showAssignRoomDialog(modalType: AssetModalType, modalMode: AssetModalMode, header: string): void {
    this.assetDetailMenuService.showAssignRoomDialog(this.activeListItem, this.factorySite, this.factorySites,
      this.rooms, modalType, modalMode, header, (details) => this.assetUpdated(details));
  }

  private updateDisplayedAssets(): void {
    if (this.filteredFactoryAssets != null) {
      this.displayedFactoryAssets = this.factoryAssetDetailsWithFields.filter(asset => this.searchedFactoryAssets
        .filter(searchedAsset => this.filteredFactoryAssets.includes(searchedAsset)).includes(asset));

      this.rebuildTree();
      if (this.selectedEnum) {
        this.rowGroupMetaDataMap = GroupByHelper.updateRowGroupMetaData(this.displayedFactoryAssets, this.selectedEnum);
      }
    }
  }

  private rebuildTree(): void {
    if (this.displayedFactoryAssets) {
      const subsystemIDs = this.displayedFactoryAssets.map(asset => asset.subsystemIds);
      const flattenedSubsystemIDs = subsystemIDs.reduce((acc, val) => acc.concat(val), []);
      const treeData: TreeNode<FactoryAssetDetailsWithFields>[] = [];
      const previousNotExpandedAssetIds: ID[] = this.treeData?.map(treeNode => !treeNode.expanded && treeNode.data.id);

      this.displayedFactoryAssets
        .filter(asset => !flattenedSubsystemIDs.includes(asset.id))
        .forEach((value: FactoryAssetDetailsWithFields) => {
          treeData.push(this.addNode(null, value));
        });

      treeData.forEach(node => {
        if (!previousNotExpandedAssetIds.includes(node.data.id)) {
          this.expandChildren(node);
        }
      });
      this.treeData = treeData;
    }
  }

  private expandChildren(node: TreeNode): void {
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
        const subsystem = this.factoryAssetDetailsWithFields.find(asset => asset.id === id);
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

  customSort(event: SortEvent): void {
    const status = 'status';

    event.data.sort((data1, data2) => {
      let value1: string;
      let value2: string;
      if (event.field === status) {
        value1 = this.factoryAssetStatuses.find(factoryAssetStatus =>
          factoryAssetStatus.factoryAssetId === data1.data.id).status.value;
        value2 = this.factoryAssetStatuses.find(factoryAssetStatus =>
          factoryAssetStatus.factoryAssetId === data2.data.id).status.value;
      } else {
        value1 = data1.data[event.field];
        value2 = data2.data[event.field];
      }

      const valuesAreEqual = 0;
      const value1IsBigger = 1;
      const value2IsBigger = -1;
      let result: number;
      if (value1 == null && value2 != null) {
        result = value2IsBigger;
      } else if (value1 != null && value2 == null) {
        result = value1IsBigger;
      } else if (value1 == null && value2 == null) {
        result = valuesAreEqual;
      } else if (typeof value1 === 'string' && typeof value2 === 'string') {
        result = value1.localeCompare(value2);
      } else {
        result = (value1 < value2) ? value2IsBigger : (value1 > value2) ? value1IsBigger : valuesAreEqual;
      }
      return (event.order * result);
    });
  }

  onZipFileUpload(event: any): void {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const selectedZipFile: File = fileList[0];
      this.ifApiService.uploadZipFileForFactoryManagerImport(this.company.id, this.factorySite.id, selectedZipFile)
        .subscribe(() => AssetsListComponent.refreshPage());
    }
  }
}
