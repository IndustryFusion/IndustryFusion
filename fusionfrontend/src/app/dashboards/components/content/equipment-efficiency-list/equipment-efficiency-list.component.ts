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

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FactoryAssetDetailsWithFields } from 'src/app/core/store/factory-asset-details/factory-asset-details.model';
import { AssetType } from 'src/app/core/store/asset-type/asset-type.model';
import { FactorySite } from 'src/app/core/store/factory-site/factory-site.model';
import { Company } from 'src/app/core/store/company/company.model';
import { TreeNode } from 'primeng/api';
import { ID } from '@datorama/akita';
import { FilterOption, FilterType } from '../../../../shared/components/ui/table-filter/filter-options';
import { TableHelper } from '../../../../core/helpers/table-helper';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertaQuery } from '../../../../core/store/ngsi-ld/alerta/alerta.query';
import { IFAlertSeverity } from '../../../../core/store/ngsi-ld/alerta/alerta.model';

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
  companies: Company[];
  @Input()
  assetTypes: AssetType[];

  rowsPerPageOptions: number[] = TableHelper.rowsPerPageOptions;
  rowCount = TableHelper.defaultRowCount;

  displayedFactoryAssets: Array<FactoryAssetDetailsWithFields> = [];
  searchedFactoryAssets: Array<FactoryAssetDetailsWithFields> = [];
  filteredFactoryAssets: Array<FactoryAssetDetailsWithFields> = [];
  treeData: Array<TreeNode<FactoryAssetDetailsWithFields>> = [];

  tableFilters: FilterOption[] = [{ filterType: FilterType.DROPDOWNFILTER, columnName: 'Asset Type', attributeToBeFiltered: 'category' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Manufacturer', attributeToBeFiltered: 'manufacturer' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Factory', attributeToBeFiltered: 'factorySiteName'}];

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private alertaQuery: AlertaQuery) {
  }

  ngOnInit(): void {
    this.rowCount = TableHelper.getValidRowCountFromUrl(this.rowCount, this.activatedRoute.snapshot, this.router);
    this.updateAlertSeverityOnNewAlerts();
  }

  private updateAlertSeverityOnNewAlerts() {
    this.alertaQuery.selectOpenAlerts().subscribe(() => {
      if (this.displayedFactoryAssets) {
        this.displayedFactoryAssets = this.displayedFactoryAssets
          .map(asset => this.alertaQuery.joinAssetDetailsWithOpenAlertSeverity(asset));
        this.updateTree();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.factoryAssetDetailsWithFields) {
      this.displayedFactoryAssets = this.searchedFactoryAssets = this.filteredFactoryAssets = this.factoryAssetDetailsWithFields;
      this.updateTree();
    }
  }

  searchAssets(event: Array<FactoryAssetDetailsWithFields>) {
    this.searchedFactoryAssets = event;
    this.updateDisplayedAssets();
  }

  filterAssets(event: Array<FactoryAssetDetailsWithFields>) {
    this.filteredFactoryAssets = event;
    this.updateDisplayedAssets();
  }

  updateDisplayedAssets() {
    this.displayedFactoryAssets = this.factoryAssetDetailsWithFields;
    this.displayedFactoryAssets = this.searchedFactoryAssets.filter(asset => this.filteredFactoryAssets.includes(asset));
    this.updateTree();
  }

  public getMaxOpenAlertSeverity(node: TreeNode<FactoryAssetDetailsWithFields>): IFAlertSeverity {
    return this.alertaQuery.getMostCriticalOpenAlertSeverityOfAssetNode(node);
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
