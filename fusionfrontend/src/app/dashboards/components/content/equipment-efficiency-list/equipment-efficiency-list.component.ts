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
import { TreeNode } from 'primeng/api';
import { ID } from '@datorama/akita';
import { FilterOption, FilterType } from '../../../../shared/components/ui/table-filter/filter-options';
import { TableHelper } from '../../../../core/helpers/table-helper';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Field, FieldOption } from '../../../../core/store/field/field.model';
import { GroupByHelper, RowGroupCount } from '../../../../core/helpers/group-by-helper';
import { AlertaAlertQuery } from '../../../../core/store/oisp/alerta-alert/alerta-alert.query';
import { IFAlertSeverity } from '../../../../core/store/oisp/alerta-alert/alerta-alert.model';

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
  searchText = '';
  groupByActive = false;
  selectedEnum: FieldOption;
  selectedEnumOptions: FieldOption[];
  rowGroupMetaDataMap: Map<ID, RowGroupCount>;


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
    private alertaAlertQuery: AlertaAlertQuery,
    private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.rowCount = TableHelper.getValidRowCountFromUrl(this.rowCount, this.activatedRoute.snapshot, this.router);
  }

  ngOnChanges(): void {
    this.displayedFactoryAssets = this.searchedFactoryAssets = this.filteredFactoryAssets = this.factoryAssetDetailsWithFields;
    this.updateTree();
  }

  searchAssets(factoryAssetsSearchedByName: Array<FactoryAssetDetailsWithFields>) {
    this.searchedFactoryAssets = factoryAssetsSearchedByName;
    this.updateDisplayedAssets();
  }

  setSearchText(searchText: string) {
    this.searchText = searchText;
  }

  filterAssets(filteredFactoryAssets: Array<FactoryAssetDetailsWithFields>) {
    this.filteredFactoryAssets = filteredFactoryAssets;
    this.updateDisplayedAssets();
  }

  groupAssets(selectedFieldOption: FieldOption) {
    this.selectedEnum = selectedFieldOption;
    this.groupByActive = this.selectedEnum !== null;
    if (this.selectedEnum) {
      this.selectedEnumOptions = this.fields.filter(field => field.id === this.selectedEnum.fieldId).pop().enumOptions;
      this.rowGroupMetaDataMap = GroupByHelper.updateRowGroupMetaData(this.displayedFactoryAssets, this.selectedEnum);
    }
  }

  hasSelectedEnumValue(asset: FactoryAssetDetailsWithFields): number {
    return GroupByHelper.getFieldIndexOfSelectedEnum(asset, this.selectedEnum);
  }

  updateDisplayedAssets() {
    this.displayedFactoryAssets = this.factoryAssetDetailsWithFields;
    this.displayedFactoryAssets = this.searchedFactoryAssets.filter(asset => this.filteredFactoryAssets.includes(asset));
    this.updateTree();
    if (this.selectedEnum) {
      this.rowGroupMetaDataMap = GroupByHelper.updateRowGroupMetaData(this.displayedFactoryAssets, this.selectedEnum);
    }
  }

  public getMaxOpenAlertSeverity(node: TreeNode<FactoryAssetDetailsWithFields>): IFAlertSeverity {
    return this.alertaAlertQuery.getMostCriticalOpenAlertSeverityOfAssetNode(node);
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
}


