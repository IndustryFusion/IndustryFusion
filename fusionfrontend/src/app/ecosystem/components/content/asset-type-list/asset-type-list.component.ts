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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetTypeDetailsQuery } from '../../../../store/asset-type-details/asset-type-details.query';
import { AssetTypeDialogComponent } from '../asset-type-dialog/asset-type-dialog.component';
import { DialogType } from '../../../../common/models/dialog-type.model';
import { DialogService } from 'primeng/dynamicdialog';
import { AssetTypeDetails } from '../../../../store/asset-type-details/asset-type-details.model';
import { AssetType } from '../../../../store/asset-type/asset-type.model';
import { ConfirmationService } from 'primeng/api';
import { FilterOption, FilterType } from '../../../../components/ui/table-filter/filter-options';
import { Observable } from 'rxjs';
import { TableSelectedItemsBarType } from '../../../../components/ui/table-selected-items-bar/table-selected-items-bar.type';

@Component({
  selector: 'app-asset-type-list',
  templateUrl: './asset-type-list.component.html',
  styleUrls: ['./asset-type-list.component.scss'],
  providers: [DialogService, ConfirmationService]
})
export class AssetTypeListComponent implements OnInit, OnDestroy {



  titleMapping:
    { [k: string]: string } = { '=0': 'No Asset types', '=1': '# Asset type', other: '# Asset types' };

  editBarMapping:
    { [k: string]: string } = {
      '=0': 'No asset type templates selected',
      '=1': '# Asset type template selected',
      other: '# Asset type templates selected'
    };

  selectedAssetTypes: AssetTypeDetails[] = [];
  activeListItem: AssetTypeDetails;
  assetTypes: AssetType[];
  assetTypes$: Observable<AssetType[]>;

  displayedAssetTypes: AssetType[];
  filteredAssetTypes: AssetType[];
  searchedAssetTypes: AssetType[];

  TableSelectedItemsBarType = TableSelectedItemsBarType;

  tableFilters: FilterOption[] = [{ filterType: FilterType.DROPDOWNFILTER, columnName: 'Asset type templates', attributeToBeFiltered: 'templateCount' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Asset series', attributeToBeFiltered: 'assetSeriesCount' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Assets', attributeToBeFiltered: 'assetCount' }];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public assetTypeDetailsQuery: AssetTypeDetailsQuery,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService) {
  }

  ngOnInit() {
    this.assetTypes$ = this.assetTypeDetailsQuery.selectAll();
    this.assetTypes$.subscribe(assetTypes => {
      this.assetTypes = this.displayedAssetTypes = this.searchedAssetTypes = this.filteredAssetTypes = assetTypes;
    })
  }

  private static assetTypeFromDetails(assetTypeDetails: AssetTypeDetails): AssetType {
    const assetType: AssetType = new AssetType();
    assetType.id = assetTypeDetails.id;
    assetType.name = assetTypeDetails.name;
    assetType.label = assetTypeDetails.label;
    assetType.description = assetTypeDetails.description;

    return assetType;
  }

  ngOnDestroy() {
    this.assetTypeDetailsQuery.resetError();
  }

  setActiveRow(assetType?) {
    if (assetType) {
      this.activeListItem = assetType;
    }
  }

  searchAssetTypes(event?: AssetType[]): void {
    this.searchedAssetTypes = event;
    this.updateAssetTypes();
  }

  filterAssetTypes(event?: AssetType[]) {
    this.filteredAssetTypes = event;
    this.updateAssetTypes();
  }

  private updateAssetTypes(): void {
    this.displayedAssetTypes = this.assetTypes;
    if (this.searchedAssetTypes) {
      this.displayedAssetTypes = this.filteredAssetTypes.filter(assetType =>
        this.searchedAssetTypes.includes(assetType));
    }
  }

  showCreateDialog() {
    this.dialogService.open(AssetTypeDialogComponent, {
      data: {
        dialogType: DialogType.CREATE
      },
      header: `Create new Asset Type`,
    });
  }

  showEditDialog(): void {
    const assetType: AssetType = AssetTypeListComponent.assetTypeFromDetails(this.activeListItem);

    this.dialogService.open(AssetTypeDialogComponent, {
      data: {
        assetType, dialogType: DialogType.EDIT
      },
      header: `Edit Asset type (${assetType?.name})`,
    });
  }

  showDeleteDialog() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the assetType ' + this.activeListItem.name + '?',
      header: 'Delete Asset Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteAssetType();
      },
      reject: () => {
      }
    });
  }

  deleteAssetType() {

  }

  deslectAssetTypes() {
    this.selectedAssetTypes = [];
  }
}
