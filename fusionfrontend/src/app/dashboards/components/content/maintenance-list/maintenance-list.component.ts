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
import { faFilter, faSearch } from '@fortawesome/free-solid-svg-icons';
import { AssetType } from 'src/app/store/asset-type/asset-type.model';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { Company } from 'src/app/store/company/company.model';
import { SelectItem } from 'primeng/api';

interface ActiveFilter {
  filterAttribute: SelectItem;
}

const CRITICAL_MAINTENANCE_VALUE = 375;
const MEDIUMTERM_MAINTENANCE_VALUE = 750;
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

  MAINTENANCE_OPERATING_HOURS_FIELD_NAME = 'Operating Hours till maintenance';
  MAINTENANCE_OPERATING_HOURS_LOWER_THRESHOLD = 150;
  MAINTENANCE_OPERATING_HOURS_UPPER_THRESHOLD = 750;

  MAINTENANCE_DAYS_FIELD_NAME = 'Days till maintenance';
  MAINTENANCE_DAYS_LOWER_THRESHOLD = 90;
  MAINTENANCE_DAYS_UPPER_THRESHOLD = 180;

  @Input()
  factoryAssetDetailsWithFields: FactoryAssetDetailsWithFields[];
  @Input()
  factorySites: FactorySite[];
  @Input()
  companies: Company[];
  @Input()
  assetTypes: AssetType[];

  displayedFactoryAssets: Array<FactoryAssetDetailsWithFields> = [];
  faFilter = faFilter;
  faSearch = faSearch;

  selectedValueMapping:
    { [k: string]: string } = { '=0': '# Values', '=1': '# Value', other: '# Values' };

  activeFilterSet: Set<ActiveFilter> = new Set();
  filterOptions: SelectItem[] = [];
  assetType: SelectItem = { value: 'assetType', label: 'Asset Type' };
  manufacturer: SelectItem = { value: 'manufacturer', label: 'Manufacturer' };
  factory: SelectItem = { value: 'factory', label: 'Factory' };
  maintenanceDue: SelectItem = { value: 'maintenanceDue', label: 'Maintenance Due' };

  dashboardFilterModalTypes = DashboardFilterModalType;
  dashboardFilterTypeActice: DashboardFilterModalType;
  selectedAssetTypes: AssetType[] = [];
  selectedCompanies: Company[] = [];
  selectedFactorySites: FactorySite[] = [];
  maintenanceValues = [SHORTTERM_PRIORITY, MEDIUMTERM_PRIORITY, LONGTERM_PRIORITY];
  selectedMaintenanceDue = [];
  searchText = '';
  index: number;

  constructor() {
  }

  ngOnInit(): void {
    this.filterOptions = [this.assetType, this.manufacturer, this.factory, this.maintenanceDue];
  }

  ngOnChanges(): void {
    this.displayedFactoryAssets = this.factoryAssetDetailsWithFields;
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
    if (this.dashboardFilterTypeActice === DashboardFilterModalType.assetTypeFilterModal) {
      this.selectedAssetTypes = [];
    } else if (this.dashboardFilterTypeActice === DashboardFilterModalType.manufacturerFilterModal) {
      this.selectedCompanies = [];
    } else if (this.dashboardFilterTypeActice === DashboardFilterModalType.factoryFilterModal) {
      this.selectedFactorySites = [];
    } else if (this.dashboardFilterTypeActice === DashboardFilterModalType.maintenanceDueFilterModal) {
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
  }

  filterAssetsByTwoMaintenanceValues() {
    if (this.selectedMaintenanceDue.includes(SHORTTERM_PRIORITY) && this.selectedMaintenanceDue.includes(MEDIUMTERM_PRIORITY)) {
      this.filterAssetsLowerThanMaintenanceValue(MEDIUMTERM_MAINTENANCE_VALUE);
    } else if (this.selectedMaintenanceDue.includes(SHORTTERM_PRIORITY) && this.selectedMaintenanceDue.includes(LONGTERM_PRIORITY)) {
      this.filterAssetOutsideTwoMaintenanceValues(CRITICAL_MAINTENANCE_VALUE, MEDIUMTERM_MAINTENANCE_VALUE);
    } else if (this.selectedMaintenanceDue.includes(MEDIUMTERM_PRIORITY) && this.selectedMaintenanceDue.includes(LONGTERM_PRIORITY)) {
      this.filterAssetsGreaterThanMaintenanceValue(CRITICAL_MAINTENANCE_VALUE);
    }
  }

  filterAssetsByOneMaintenanceValue() {
    if (this.selectedMaintenanceDue.includes(SHORTTERM_PRIORITY)) {
      this.filterAssetsLowerThanMaintenanceValue(CRITICAL_MAINTENANCE_VALUE);
    } else if (this.selectedMaintenanceDue.includes(MEDIUMTERM_PRIORITY)) {
      this.filterAssetsBetweenTwoMaintenanceValues(CRITICAL_MAINTENANCE_VALUE, MEDIUMTERM_MAINTENANCE_VALUE);
    } else if (this.selectedMaintenanceDue.includes(LONGTERM_PRIORITY)) {
      this.filterAssetsGreaterThanMaintenanceValue(MEDIUMTERM_MAINTENANCE_VALUE);
    }
  }

  filterAssetsLowerThanMaintenanceValue(value: number) {
    this.displayedFactoryAssets = this.displayedFactoryAssets.filter(asset => {
      this.index = asset.fields.findIndex(field => field.name === this.MAINTENANCE_OPERATING_HOURS_FIELD_NAME);
      if (this.index !== -1) {
        return Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) < value;
      }
    });
  }

  filterAssetsGreaterThanMaintenanceValue(value: number) {
    this.displayedFactoryAssets = this.displayedFactoryAssets.filter(asset => {
      this.index = asset.fields.findIndex(field => field.name === this.MAINTENANCE_OPERATING_HOURS_FIELD_NAME);
      if (this.index !== -1) {
        return Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) > value;
      }
    });
  }

  filterAssetOutsideTwoMaintenanceValues(lowerValue: number, greaterValue: number) {
    this.displayedFactoryAssets = this.displayedFactoryAssets.filter(asset => {
      this.index = asset.fields.findIndex(field => field.name === this.MAINTENANCE_OPERATING_HOURS_FIELD_NAME);
      if (this.index !== -1) {
        return Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) < lowerValue ||
          Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) > greaterValue;
      }
    });
  }

  filterAssetsBetweenTwoMaintenanceValues(lowerValue: number, greaterValue: number) {
    this.displayedFactoryAssets = this.displayedFactoryAssets.filter(asset => {
      this.index = asset.fields.findIndex(field => field.name === this.MAINTENANCE_OPERATING_HOURS_FIELD_NAME);
      if (this.index !== -1) {
        return Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) < greaterValue &&
          Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) > lowerValue;
      }
    });
  }

  public isMaintenanceNeededSoon(asset: FactoryAssetDetailsWithFields): boolean {
    const maintenance_days = +asset.fields.find(field => field.name === this.MAINTENANCE_DAYS_FIELD_NAME)?.value;
    const maintenance_hours = +asset.fields.find(field => field.name === this.MAINTENANCE_OPERATING_HOURS_FIELD_NAME)?.value;
    const maintenance_days_percentage = maintenance_days / this.MAINTENANCE_OPERATING_HOURS_UPPER_THRESHOLD;
    const maintenance_hours_percentage = maintenance_hours / this.MAINTENANCE_DAYS_UPPER_THRESHOLD;
    if (maintenance_days_percentage < 0.25 || maintenance_hours_percentage < 0.25) {
      return true;
    }
    return false;
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
