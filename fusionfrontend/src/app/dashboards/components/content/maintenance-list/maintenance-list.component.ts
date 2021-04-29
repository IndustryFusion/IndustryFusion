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

import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { AssetDetailsWithFields, DashboardFilterModalType } from 'src/app/store/asset-details/asset-details.model'
import { faFilter, faSearch } from '@fortawesome/free-solid-svg-icons';
import { ID } from '@datorama/akita';
import { AssetType } from 'src/app/store/asset-type/asset-type.model';
import { Location } from 'src/app/store/location/location.model';
import { Company } from 'src/app/store/company/company.model';

interface FilterAttribute {
  type: string,
  name: string,
}

interface ActiveFilter {
  filterAttribute: FilterAttribute;
}

interface MaintenanceFilter {
  id: ID;
  urgency: string;
}

const criticalMaintenacneValue = 375;
const mediumtermMaintenacneValue = 750;

@Component({
  selector: 'app-maintenance-list',
  templateUrl: './maintenance-list.component.html',
  styleUrls: ['./maintenance-list.component.scss']
})
export class MaintenanceListComponent implements OnInit, OnChanges {

  @Input()
  assetDetailsWithFields: AssetDetailsWithFields[];
  @Input()
  locations: Location[];
  @Input()
  companies: Company[];
  @Input()
  assetTypes: AssetType[];

  displayedAssets: Array<AssetDetailsWithFields> = [];
  faFilter = faFilter;
  faSearch = faSearch;

  selectedValueMapping:
  { [k: string]: string } = { '=0': '# Values', '=1': '# Value', other: '# Values' };

  activeFilterSet: Set<ActiveFilter> = new Set();
  filterOptions: FilterAttribute[] = [];
  assetType: FilterAttribute =  { type: 'assetType', name: 'Asset Type' };
  manufacturer: FilterAttribute =  { type: 'manufacturer', name: 'Manufacturer' };
  factory: FilterAttribute =  { type: 'factory', name: 'Factory' };
  maintenanceDue: FilterAttribute =  { type: 'maintenanceDue', name: 'Maintenance Due' };

  dashboardFilterModalTypes = DashboardFilterModalType;
  dashboardFilterTypeActice: DashboardFilterModalType;
  selectedAssetTypes: AssetType[] = [];
  selectedCompanies: Company[] = [];
  selectedLocations: Location[] = [];
  maintenanceValues: MaintenanceFilter[] = [{ id: 0, urgency: 'Critical (red)' },
    { id: 1, urgency: 'Soon (grey)' }, { id: 2, urgency: 'Longterm (blue)' }];
  selectedMaintenanceDue = [];
  searchText = '';

  constructor(
  ) { }

  ngOnInit(): void {
    this.filterOptions = [this.assetType, this.manufacturer, this.factory, this.maintenanceDue];
  }

  ngOnChanges(): void {
    this.displayedAssets = this.assetDetailsWithFields;
  }

  searchAssets() {
    this.filterAssets();
  }

  addFilter() {
    const activeFilters: FilterAttribute[] = [];
    this.activeFilterSet.forEach(filter => {
      activeFilters.push(filter.filterAttribute);
    })
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
          this.selectedLocations = [];
        } else if (filter.filterAttribute === this.maintenanceDue) {
          this.selectedMaintenanceDue = [];
        }
        this.activeFilterSet.delete(filter)
      }
    })
    this.filterAssets();
  }

  clearAllFilters() {
    this.activeFilterSet.clear();
    this.selectedAssetTypes = [];
    this.selectedCompanies = [];
    this.selectedLocations = [];
    this.selectedMaintenanceDue = [];
    this.filterAssets();
  }

  clearSelectFilterValues() {
    if (this.dashboardFilterTypeActice === DashboardFilterModalType.assetTypeFilterModal) {
      this.selectedAssetTypes = [];
    } else if (this.dashboardFilterTypeActice === DashboardFilterModalType.manufacturerFilterModal) {
      this.selectedCompanies = [];
    } else if (this.dashboardFilterTypeActice === DashboardFilterModalType.factoryFilterModal) {
      this.selectedLocations = [];
    } else if (this.dashboardFilterTypeActice ===  DashboardFilterModalType.maintenanceDueFilterModal) {
      this.selectedMaintenanceDue = [];
    }
  }

  filterAssets() {
    const locationNames = this.selectedLocations.map(location => location.name);
    const assetTypeNames = this.selectedAssetTypes.map(assetType => assetType.description);
    const companyNames = this.selectedCompanies.map(company => company.description)
    this.displayedAssets = this.assetDetailsWithFields;

    if (this.searchText) {
      this.displayedAssets = this.displayedAssets.filter(asset => asset.name.toLowerCase().includes(this.searchText.toLowerCase()))
    }
    if (locationNames.length > 0) {
      this.displayedAssets = this.displayedAssets.filter(asset => locationNames.includes(asset.locationName));
    }
    if (assetTypeNames.length > 0) {
      this.displayedAssets = this.displayedAssets.filter(asset => assetTypeNames.includes(asset.category));
    }
    if (companyNames.length > 0) {
      this.displayedAssets = this.displayedAssets.filter(asset => companyNames.includes(asset.manufacturer));
    }

    if (this.selectedMaintenanceDue.length > 0) {
      switch (this.selectedMaintenanceDue.length) {
        case 3:
          break;
        case 2:
          this.filterAssetsByTwoMaintenanceValues();
          break;
        case 1:
          this.filterAssetsByOneMaintenanceValue();
          break;
      };
    }
  }

  filterAssetsByTwoMaintenanceValues() {
    if (this.selectedMaintenanceDue.includes('Critical (red)') && this.selectedMaintenanceDue.includes('Soon (grey)'))
      this.filterAssetsLowerThanMaintenanceValue(mediumtermMaintenacneValue);
    else if (this.selectedMaintenanceDue.includes('Critical (red)') && this.selectedMaintenanceDue.includes('Longterm (blue)'))
      this.filterAssetsLtAndGtMaintenanceValue(criticalMaintenacneValue, mediumtermMaintenacneValue);
    else if (this.selectedMaintenanceDue.includes('Soon (grey)') && this.selectedMaintenanceDue.includes('Longterm (blue)'))
      this.filterAssetsGreaterThanMaintenanceValue(criticalMaintenacneValue);
  }

  filterAssetsByOneMaintenanceValue() {
    if (this.selectedMaintenanceDue.includes('Critical (red)'))
      this.filterAssetsLowerThanMaintenanceValue(criticalMaintenacneValue);
    else if (this.selectedMaintenanceDue.includes('Soon (grey)'))
      this.filterAssetsLtAndGtMaintenanceValue(mediumtermMaintenacneValue, criticalMaintenacneValue);
    else if (this.selectedMaintenanceDue.includes('Longterm (blue)'))
      this.filterAssetsGreaterThanMaintenanceValue(mediumtermMaintenacneValue);
  }

  filterAssetsLowerThanMaintenanceValue(value: number) {
    this.displayedAssets = this.displayedAssets.filter(asset => {
      const index = asset.fields.findIndex(field => field.name === 'Hours till maintenance');
      if (index !== -1)
        return Number.parseInt(asset.fields[index].value, 10) < value;
    });
  }

  filterAssetsGreaterThanMaintenanceValue(value: number) {
    this.displayedAssets = this.displayedAssets.filter(asset => {
      const index = asset.fields.findIndex(field => field.name === 'Hours till maintenance');
      if (index !== -1)
        return Number.parseInt(asset.fields[index].value, 10) > value;
    });
  }

  filterAssetsLtAndGtMaintenanceValue(lowerValue: number, greaterValue: number) {
    this.displayedAssets = this.displayedAssets.filter(asset => {
      const index = asset.fields.findIndex(field => field.name === 'Hours till maintenance');
      if (index !== -1)
        return Number.parseInt(asset.fields[index].value, 10) < lowerValue || Number.parseInt(asset.fields[index].value, 10) > greaterValue;
    });
  }

}
