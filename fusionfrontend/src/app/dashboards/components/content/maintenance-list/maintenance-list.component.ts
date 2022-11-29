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
import { faChevronCircleDown, faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';
import { AssetType } from 'src/app/core/store/asset-type/asset-type.model';
import { FactorySite } from 'src/app/core/store/factory-site/factory-site.model';
import { Company } from 'src/app/core/store/company/company.model';
import { FilterOption, FilterType } from '../../../../shared/components/ui/table-filter/filter-options';
import { SortEvent, TreeNode } from 'primeng/api';
import { ID } from '@datorama/akita';
import {
  AssetMaintenanceUtils,
  AssetMaintenanceUtils as Utils,
  MaintenanceType
} from '../../../../factory/util/asset-maintenance-utils';
import { TableHelper } from '../../../../core/helpers/table-helper';
import { ActivatedRoute, Router } from '@angular/router';
import { IFAlertSeverity } from '../../../../core/store/ngsi-ld/alerta-alert/alerta-alert.model';
import { AlertaAlertQuery } from '../../../../core/store/ngsi-ld/alerta-alert/alerta-alert.query';


@Component({
  selector: 'app-maintenance-list',
  templateUrl: './maintenance-list.component.html',
  styleUrls: ['./maintenance-list.component.scss']
})
export class MaintenanceListComponent implements OnInit, OnChanges {

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

  faChevronCircleDown = faChevronCircleDown;
  faChevronCircleUp = faChevronCircleUp;

  searchText = '';

  tableFilters: FilterOption[] = [{ filterType: FilterType.DROPDOWNFILTER, columnName: 'Asset Type', attributeToBeFiltered: 'category' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Manufacturer', attributeToBeFiltered: 'manufacturer' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Factory', attributeToBeFiltered: 'factorySiteName'},
    { filterType: FilterType.NUMBERBASEDFILTER, columnName: 'Maintenance Due', attributeToBeFiltered: 'maintenanceDue'}];

  utils = Utils;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private alertaAlertQuery: AlertaAlertQuery) {
  }

  private static isMaintenanceNeededSoonForMaintenanceType(asset: FactoryAssetDetailsWithFields, type: MaintenanceType) {
    const maintenanceValue = Utils.getMaintenanceValue(asset, type);
    return maintenanceValue && maintenanceValue < type.lowerThreshold;
  }

  ngOnInit(): void {
    this.rowCount = TableHelper.getValidRowCountFromUrl(this.rowCount, this.activatedRoute.snapshot, this.router);
    this.updateAlertSeverityOnNewAlerts();
  }

  private updateAlertSeverityOnNewAlerts() {
    this.alertaAlertQuery.selectOpenAlerts().subscribe(() => {
      if (this.displayedFactoryAssets) {
        this.displayedFactoryAssets = this.displayedFactoryAssets
          .map(asset => this.alertaAlertQuery.joinAssetDetailsWithOpenAlertSeverity(asset));
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

  openNode(node: TreeNode) {
    node.expanded = !node.expanded;
    this.treeData = [...this.treeData];
  }

  public isMaintenanceNeededSoon(node: TreeNode): boolean {
    const asset = node.data;
    return MaintenanceListComponent.isMaintenanceNeededSoonForMaintenanceType(asset, AssetMaintenanceUtils.maintenanceHours)
      || MaintenanceListComponent.isMaintenanceNeededSoonForMaintenanceType(asset, AssetMaintenanceUtils.maintenanceDays);
  }

  public isChildrenMaintenanceNeededSoon(node: TreeNode): boolean {
    let result = false;
    if (node.children?.length > 0) {
      for (const child of node.children) {
        result = result || this.isMaintenanceNeededSoon(child);
        result = result || this.isChildrenMaintenanceNeededSoon(child);
      }
    }
    return result;
  }

  private updateTree() {
    if (this.displayedFactoryAssets) {
      const expandedNodeIDs = this.getExpandedNodeIDs(this.treeData);
      const subsystemIDs = this.displayedFactoryAssets.map(asset => asset.subsystemIds);
      const flattenedSubsystemIDs = subsystemIDs.reduce((acc, val) => acc.concat(val), []);
      const treeData: TreeNode<FactoryAssetDetailsWithFields>[] = [];
      this.displayedFactoryAssets
        .filter(asset => !flattenedSubsystemIDs.includes(asset.id))
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
                  value: FactoryAssetDetailsWithFields, expandedNodeIDs: ID[]): TreeNode<FactoryAssetDetailsWithFields> {
    const treeNode: TreeNode<FactoryAssetDetailsWithFields> = {
      expanded: expandedNodeIDs.includes(value.id),
      data: value,
      parent,
    };
    if (value.subsystemIds?.length > 0) {
      const children: TreeNode<FactoryAssetDetailsWithFields>[] = [];
      value.subsystemIds.forEach(id => {
        const subsytem = this.factoryAssetDetailsWithFields.find(asset => asset.id === id);
        if (subsytem) {
          children.push(this.addNode(treeNode, subsytem, expandedNodeIDs));
        }
      });
      treeNode.children = children;
    }
    return treeNode;
  }

  updateRowCountInUrl(rowCount: number): void {
    TableHelper.updateRowCountInUrl(rowCount, this.router);
  }

  customSort(event: SortEvent) {
    const daysTillMaintenace = 'daysTillMaintenance';
    const operatingHoursTillMaintenance = 'operatingHoursTillMaintenance';
    const type = (event.field === daysTillMaintenace || event.field === operatingHoursTillMaintenance) ? event.field ===
      daysTillMaintenace ? AssetMaintenanceUtils.maintenanceDays : AssetMaintenanceUtils.maintenanceHours : null;

    event.data.sort((data1, data2) => {
      let value1;
      let value2;
      let result;

      if (event.field === daysTillMaintenace || event.field === operatingHoursTillMaintenance) {
        value1 = AssetMaintenanceUtils.getMaintenanceValue(data1.data, type);
        value2 = AssetMaintenanceUtils.getMaintenanceValue(data2.data, type);
      } else {
        value1 = data1.data[event.field];
        value2 = data2.data[event.field];
      }

      if (value1 == null && value2 != null) {
        result = -1;
      }
      else if (value1 != null && value2 == null) {
        result = 1;
      }
      else if (value1 == null && value2 == null) {
        result = 0;
      }
      else if (typeof value1 === 'string' && typeof value2 === 'string') {
        result = value1.localeCompare(value2);
      }
      else if (isNaN(value1) && !isNaN(value2)) {
        result = event.order;
      }
      else if (!isNaN(value1) && isNaN(value2)) {
        result = event.order * -1;
      }
      else {
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
      }

      return (event.order * result);
    });
  }
}
