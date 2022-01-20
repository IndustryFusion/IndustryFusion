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

import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FactoryAssetDetailsWithFields } from 'src/app/core/store/factory-asset-details/factory-asset-details.model';
import { AssetType } from 'src/app/core/store/asset-type/asset-type.model';
import { FactorySite } from 'src/app/core/store/factory-site/factory-site.model';
import { Company } from 'src/app/core/store/company/company.model';
import {  TreeNode } from 'primeng/api';
import { ID } from '@datorama/akita';
import { FilterOption, FilterType } from '../../../../shared/components/ui/table-filter/filter-options';
import { OispAlert, OispAlertPriority } from '../../../../core/store/oisp/oisp-alert/oisp-alert.model';
import { faExclamationCircle, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { TableHelper } from '../../../../core/helpers/table-helper';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Field, FieldOption } from '../../../../core/store/field/field.model';

@Component({
  selector: 'app-equipment-efficiency-list',
  templateUrl: './equipment-efficiency-list.component.html',
  styleUrls: ['./equipment-efficiency-list.component.scss']
})
export class EquipmentEfficiencyListComponent implements OnInit, OnChanges {

  @Input()
  factoryAssetDetailsWithFields: FactoryAssetDetailsWithFields[];
  @Input()
  factorySites: FactorySite[];
  @Input()
  fields: Field[];
  @Input()
  companies: Company[];
  @Input()
  assetTypes: AssetType[];

  rowsPerPageOptions: number[] = TableHelper.rowsPerPageOptions;
  rowCount = TableHelper.defaultRowCount;

  displayedFactoryAssets: Array<FactoryAssetDetailsWithFields> = [];
  searchedFactoryAssets: Array<FactoryAssetDetailsWithFields> = [];
  filteredFactoryAssets: Array<FactoryAssetDetailsWithFields> = [];
  treeData: Array<TreeNode<FactoryAssetDetailsWithFields>> = [];
  groupByActive = false;
  selectedEnum: FieldOption;
  selectedEnumOptions: FieldOption[];
  rowGroupMetadata: any;

  faInfoCircle = faInfoCircle;
  faExclamationCircle = faExclamationCircle;
  faExclamationTriangle = faExclamationTriangle;
  OispPriority = OispAlertPriority;

  tableFilters: FilterOption[] = [
    { filterType: FilterType.DROPDOWNFILTER, columnName: this.translate.instant('APP.COMMON.TERMS.ASSET_TYPE'),
      attributeToBeFiltered: 'category' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: this.translate.instant('APP.COMMON.TERMS.MANUFACTURER'),
      attributeToBeFiltered: 'manufacturer' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: this.translate.instant('APP.COMMON.TERMS.FACTORY'),
      attributeToBeFiltered: 'factorySiteName'}
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.rowCount = TableHelper.getValidRowCountFromUrl(this.rowCount, this.activatedRoute.snapshot, this.router);
  }

  ngOnChanges(): void {
    this.displayedFactoryAssets = this.searchedFactoryAssets = this.filteredFactoryAssets = this.factoryAssetDetailsWithFields;
    this.updateTree();
  }

  searchAssets(event: Array<FactoryAssetDetailsWithFields>) {
    this.searchedFactoryAssets = event;
    this.updateDisplayedAssets();
  }

  filterAssets(event: Array<FactoryAssetDetailsWithFields>) {
    this.filteredFactoryAssets = event;
    this.updateDisplayedAssets();
  }

  groupAssets(event: FieldOption) {
    this.selectedEnum = event;
    this.groupByActive = this.selectedEnum !== null;
    if (this.selectedEnum) {
      this.selectedEnumOptions = this.fields.filter(field => field.id === this.selectedEnum.fieldId).pop().enumOptions;
      this.updateRowGroupMetaData();
    }
  }

  updateDisplayedAssets() {
    this.displayedFactoryAssets = this.factoryAssetDetailsWithFields;
    // TODO
    this.displayedFactoryAssets = this.searchedFactoryAssets.filter(asset => this.filteredFactoryAssets.includes(asset));
    this.updateTree();
    if (this.selectedEnum) {
      this.updateRowGroupMetaData();
    }
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

  private updateTree() {
    if (this.displayedFactoryAssets) {
      const expandedNodeIDs = this.getExpandedNodeIDs(this.treeData);
      const map = this.displayedFactoryAssets.map(asset => asset.subsystemIds);
      const reduce = map.reduce((acc, val) => acc.concat(val), []);
      const treeData: TreeNode<FactoryAssetDetailsWithFields>[] = [];
      this.displayedFactoryAssets
        .filter(asset => !reduce.includes(asset.id))
        .forEach((value: FactoryAssetDetailsWithFields) => {
          treeData.push(this.addNode(null, value, expandedNodeIDs));
        });
      this.treeData = treeData;
    }
  }

  private getExpandedNodeIDs(treeData: TreeNode[]): ID[] {
    const expanded: ID[] = [];
    for (const node of treeData) {
      if (node.expanded) {
        expanded.push(node.data.id);
        expanded.push(...this.getExpandedNodeIDs(node.children));
      }
    }
    return expanded;
  }

  private addNode(parent: TreeNode<FactoryAssetDetailsWithFields>,
                  value: FactoryAssetDetailsWithFields, expandetNodeIDs: ID[]): TreeNode<FactoryAssetDetailsWithFields> {
    const treeNode: TreeNode<FactoryAssetDetailsWithFields> = {
      expanded: expandetNodeIDs.includes(value.id),
      data: value,
      parent,
    };
    if (value.subsystemIds?.length > 0) {
      const children: TreeNode<FactoryAssetDetailsWithFields>[] = [];
      value.subsystemIds.forEach(id => {
        const subsystem = this.factoryAssetDetailsWithFields.find(asset => asset.id === id);
        if (subsystem) {
          children.push(this.addNode(treeNode, subsystem, expandetNodeIDs));
        }
      });
      treeNode.children = children;
    }
    return treeNode;
  }

  isLastChildElement(rowNode: any): boolean {
    const subsystemIds = rowNode.parent?.data.subsystemIds;
    if (subsystemIds) {
      const index = subsystemIds.findIndex((value) => value === rowNode.node.data.id);
      return index === subsystemIds.length - 1;
    } else {
      return null;
    }
  }

  updateRowCountInUrl(rowCount: number): void {
    TableHelper.updateRowCountInUrl(rowCount, this.router);
  }


  updateRowGroupMetaData() {
    this.rowGroupMetadata = { };
    const sortedAssetFieldIndexTuples = this.generateSoredAssetFieldIndexMap();

    if (sortedAssetFieldIndexTuples) {
      for (let i = 0; i < sortedAssetFieldIndexTuples.length; i++) {
        const rowData = sortedAssetFieldIndexTuples[i];
        const enumValue = rowData.fieldIndex >= 0 ? rowData.asset.fields[rowData.fieldIndex].value : - 1;

        if (i === 0) {
          this.rowGroupMetadata[enumValue] = { index: 0, size: 1 };
        }
        else {
          const previousRowData = sortedAssetFieldIndexTuples[i - 1];
          const previousRowGroup = previousRowData.fieldIndex >= 0 ? previousRowData.asset.fields[previousRowData.fieldIndex].value : -1;
          if (enumValue === previousRowGroup) {
            this.rowGroupMetadata[enumValue].size++;
          } else {
            this.rowGroupMetadata[enumValue] = { index: i, size: 1 };
          }
        }
      }
    }
  }

  generateSoredAssetFieldIndexMap() {
    return this.displayedFactoryAssets.sort((asset1, asset2) => {
      const fieldIndexOfAsset1 = this.getFieldIndexOfSelectedEnum(asset1);
      const fieldIndexOfAsset2 = this.getFieldIndexOfSelectedEnum(asset2);
      if (fieldIndexOfAsset1 < 0) {
        return 0;
      } else if (fieldIndexOfAsset2 < 0) {
        return -1;
      } else {
        return asset1.fields[fieldIndexOfAsset1].value.localeCompare(asset2.fields[fieldIndexOfAsset2].value);
      }
    }).map(factoryAsset => {
      return { asset: factoryAsset, fieldIndex: this.getFieldIndexOfSelectedEnum(factoryAsset) };
    });
  }

  getFieldIndexOfSelectedEnum(factoryAsset: FactoryAssetDetailsWithFields): number {
    return factoryAsset.fields.indexOf(factoryAsset.fields.filter(field => field.name === this.selectedEnum.optionLabel).pop());
  }

}
