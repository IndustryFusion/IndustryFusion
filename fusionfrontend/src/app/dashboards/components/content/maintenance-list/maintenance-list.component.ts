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
import {
  DashboardFilterModalType,
  FactoryAssetDetailsWithFields
} from 'src/app/store/factory-asset-details/factory-asset-details.model';
import { faChevronCircleDown, faChevronCircleUp, faFilter, faSearch } from '@fortawesome/free-solid-svg-icons';
import { AssetType } from 'src/app/store/asset-type/asset-type.model';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { Company } from 'src/app/store/company/company.model';
import { SelectItem, TreeNode } from 'primeng/api';
import { OispAlert, OispAlertPriority } from 'src/app/store/oisp/oisp-alert/oisp-alert.model';
import { ID } from '@datorama/akita';
import {
  AssetMaintenanceUtils,
  AssetMaintenanceUtils as Utils,
  MaintenanceType
} from '../../../../factory/util/asset-maintenance-utils';

interface ActiveFilter {
  filterAttribute: SelectItem;
}

const SHORTTERM_PRIORITY = 'Critical (red)';
const MEDIUMTERM_PRIORITY = 'Mediumterm (grey)';
const LONGTERM_PRIORITY = 'Longterm (blue)';
const RADIX_DECIMAL = 10;

@Component({
  selector: 'app-maintenance-list',
  templateUrl: './maintenance-list.component.html',
  styleUrls: ['./maintenance-list.component.scss']
})
export class MaintenanceListComponent implements OnInit, OnChanges {

  readonly MAINTENANCE_HIGHLIGHT_PERCENTAGE = 25;

  @Input()
  factoryAssetDetailsWithFields: FactoryAssetDetailsWithFields[];
  @Input()
  factorySites: FactorySite[];
  @Input()
  companies: Company[];
  @Input()
  assetTypes: AssetType[];
  displayedFactoryAssets: Array<FactoryAssetDetailsWithFields> = [];
  treeData: Array<TreeNode<FactoryAssetDetailsWithFields>> = [];
  faFilter = faFilter;
  faSearch = faSearch;
  faChevronCircleDown = faChevronCircleDown;
  faChevronCircleUp = faChevronCircleUp;
  OispPriority = OispAlertPriority;

  selectedValueMapping:
    { [k: string]: string } = { '=0': '# Values', '=1': '# Value', other: '# Values' };

  activeFilterSet: Set<ActiveFilter> = new Set();
  filterOptions: SelectItem[] = [];
  assetType: SelectItem = { value: 'assetType', label: 'Asset Type' };
  manufacturer: SelectItem = { value: 'manufacturer', label: 'Manufacturer' };
  factory: SelectItem = { value: 'factory', label: 'Factory' };
  maintenanceDue: SelectItem = { value: 'maintenanceDue', label: 'Maintenance Due (Days)' };

  dashboardFilterModalTypes = DashboardFilterModalType;
  dashboardFilterTypeActive: DashboardFilterModalType;
  selectedAssetTypes: AssetType[] = [];
  selectedCompanies: Company[] = [];
  selectedFactorySites: FactorySite[] = [];
  maintenanceValues = [SHORTTERM_PRIORITY, MEDIUMTERM_PRIORITY, LONGTERM_PRIORITY];
  selectedMaintenanceDue = [];
  searchText = '';
  index: number;

  utils = Utils;

  constructor() {
  }


  ngOnInit(): void {
    this.filterOptions = [this.assetType, this.manufacturer, this.factory, this.maintenanceDue];
  }

  ngOnChanges(): void {
    this.displayedFactoryAssets = this.factoryAssetDetailsWithFields;
    this.updateTree();
  }

  searchAssets() {
    this.filterAssets();
  }

  addFilter() {
    const activeFilters: SelectItem[] = [];
    this.activeFilterSet.forEach(filter => {
      activeFilters.push(filter.filterAttribute);
    });
    if (!activeFilters.includes(this.assetType)) {
      this.activeFilterSet.add({ filterAttribute: this.assetType });
    } else if (!activeFilters.includes(this.manufacturer)) {
      this.activeFilterSet.add({ filterAttribute: this.manufacturer });
    } else if (!activeFilters.includes(this.factory)) {
      this.activeFilterSet.add({ filterAttribute: this.factory });
    } else if (!activeFilters.includes(this.maintenanceDue)) {
      this.activeFilterSet.add({ filterAttribute: this.maintenanceDue });
    }
  }

  clearSingleFilter(filterToRemove) {
    this.activeFilterSet.forEach(filter => {
      if (filter === filterToRemove) {
        if (filter.filterAttribute === this.assetType) {
          this.selectedAssetTypes = [];
        } else if (filter.filterAttribute === this.manufacturer) {
          this.selectedCompanies = [];
        } else if (filter.filterAttribute === this.factory) {
          this.selectedFactorySites = [];
        } else if (filter.filterAttribute === this.maintenanceDue) {
          this.selectedMaintenanceDue = [];
        }
        this.activeFilterSet.delete(filter);
      }
    });
    this.filterAssets();
  }

  clearAllFilters() {
    this.activeFilterSet.clear();
    this.selectedAssetTypes = [];
    this.selectedCompanies = [];
    this.selectedFactorySites = [];
    this.selectedMaintenanceDue = [];
    this.filterAssets();
  }

  clearSelectFilterValues() {
    if (this.dashboardFilterTypeActive === DashboardFilterModalType.assetTypeFilterModal) {
      this.selectedAssetTypes = [];
    } else if (this.dashboardFilterTypeActive === DashboardFilterModalType.manufacturerFilterModal) {
      this.selectedCompanies = [];
    } else if (this.dashboardFilterTypeActive === DashboardFilterModalType.factoryFilterModal) {
      this.selectedFactorySites = [];
    } else if (this.dashboardFilterTypeActive === DashboardFilterModalType.maintenanceDueFilterModal) {
      this.selectedMaintenanceDue = [];
    }
  }

  filterAssets() {
    this.displayedFactoryAssets = this.factoryAssetDetailsWithFields;

    this.filterBySearchText();
    this.filterByFactorySite();
    this.filterByAssetType();
    this.filterByCompany();

    if (this.selectedMaintenanceDue.length > 0) {
      if (this.selectedMaintenanceDue.length === 2) {
        this.filterAssetsByTwoMaintenanceValues();
      } else if (this.selectedMaintenanceDue.length === 1) {
        this.filterAssetsByOneMaintenanceValue();
      }
    }
    this.updateTree();
  }

  filterAssetsByTwoMaintenanceValues() {
    if (this.selectedMaintenanceDue.includes(SHORTTERM_PRIORITY) && this.selectedMaintenanceDue.includes(MEDIUMTERM_PRIORITY)) {
      this.filterAssetsLowerThanMaintenanceValue(Utils.maintenanceDays.upperThreshold);
    } else if (this.selectedMaintenanceDue.includes(SHORTTERM_PRIORITY) && this.selectedMaintenanceDue.includes(LONGTERM_PRIORITY)) {
      this.filterAssetOutsideTwoMaintenanceValues(Utils.maintenanceDays.lowerThreshold, Utils.maintenanceDays.upperThreshold);
    } else if (this.selectedMaintenanceDue.includes(MEDIUMTERM_PRIORITY) && this.selectedMaintenanceDue.includes(LONGTERM_PRIORITY)) {
      this.filterAssetsGreaterThanMaintenanceValue(Utils.maintenanceDays.lowerThreshold);
    }
  }

  filterAssetsByOneMaintenanceValue() {
    if (this.selectedMaintenanceDue.includes(SHORTTERM_PRIORITY)) {
      this.filterAssetsLowerThanMaintenanceValue(Utils.maintenanceDays.lowerThreshold);
    } else if (this.selectedMaintenanceDue.includes(MEDIUMTERM_PRIORITY)) {
      this.filterAssetsBetweenTwoMaintenanceValues(Utils.maintenanceDays.lowerThreshold, Utils.maintenanceDays.upperThreshold);
    } else if (this.selectedMaintenanceDue.includes(LONGTERM_PRIORITY)) {
      this.filterAssetsGreaterThanMaintenanceValue(Utils.maintenanceDays.upperThreshold);
    }
  }

  filterAssetsLowerThanMaintenanceValue(value: number) {
    this.displayedFactoryAssets = this.displayedFactoryAssets.filter(asset => {
      this.index = asset.fields.findIndex(field => field.name === Utils.maintenanceDays.fieldName);
      if (this.index !== -1) {
        return Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) < value;
      }
    });
  }

  filterAssetsGreaterThanMaintenanceValue(value: number) {
    this.displayedFactoryAssets = this.displayedFactoryAssets.filter(asset => {
      this.index = asset.fields.findIndex(field => field.name === Utils.maintenanceDays.fieldName);
      if (this.index !== -1) {
        return Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) > value;
      }
    });
  }

  filterAssetOutsideTwoMaintenanceValues(lowerValue: number, greaterValue: number) {
    this.displayedFactoryAssets = this.displayedFactoryAssets.filter(asset => {
      this.index = asset.fields.findIndex(field => field.name === Utils.maintenanceDays.fieldName);
      if (this.index !== -1) {
        return Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) < lowerValue ||
          Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) > greaterValue;
      }
    });
  }

  filterAssetsBetweenTwoMaintenanceValues(lowerValue: number, greaterValue: number) {
    this.displayedFactoryAssets = this.displayedFactoryAssets.filter(asset => {
      this.index = asset.fields.findIndex(field => field.name === Utils.maintenanceDays.fieldName);
      if (this.index !== -1) {
        return Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) < greaterValue &&
          Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) > lowerValue;
      }
    });
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
      return null;
    }
  }

  openNode(node: TreeNode) {
    node.expanded = !node.expanded;
    this.treeData = [...this.treeData];
  }

  public isMaintenanceNeededSoon(node: TreeNode): boolean {
    const asset = node.data;
    return this.isMaintenanceNeededSoonForMaintenanceType(asset, AssetMaintenanceUtils.maintenanceHours)
      || this.isMaintenanceNeededSoonForMaintenanceType(asset, AssetMaintenanceUtils.maintenanceDays);
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

  private isMaintenanceNeededSoonForMaintenanceType(asset: FactoryAssetDetailsWithFields, type: MaintenanceType) {
    return Utils.getMaintenanceValue(asset, type)
      && Utils.getMaintenancePercentage(asset, type) < this.MAINTENANCE_HIGHLIGHT_PERCENTAGE;
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

  private filterBySearchText() {
    if (this.searchText) {
      this.displayedFactoryAssets = this.displayedFactoryAssets
        .filter(asset => asset.name.toLowerCase().includes(this.searchText.toLowerCase()));
    }
  }

  private filterByCompany() {
    const companyNames = this.selectedCompanies.map(company => company.description);
    if (companyNames.length > 0) {
      this.displayedFactoryAssets = this.displayedFactoryAssets.filter(asset => companyNames.includes(asset.manufacturer));
    }
  }

  private filterByAssetType() {
    const assetTypeNames = this.selectedAssetTypes.map(assetType => assetType.description);
    if (assetTypeNames.length > 0) {
      this.displayedFactoryAssets = this.displayedFactoryAssets.filter(asset => assetTypeNames.includes(asset.category));
    }
  }

  private filterByFactorySite() {
    const factorySiteNames = this.selectedFactorySites.map(factorySite => factorySite.name);
    if (factorySiteNames.length > 0) {
      this.displayedFactoryAssets = this.displayedFactoryAssets
        .filter(asset => factorySiteNames.includes(asset.factorySiteName));
    }
  }
}
