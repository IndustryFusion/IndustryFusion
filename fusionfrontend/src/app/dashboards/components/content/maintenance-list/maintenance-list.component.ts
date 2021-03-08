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
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ID } from '@datorama/akita';
import { AssetType } from 'src/app/store/asset-type/asset-type.model';
import { Location } from 'src/app/store/location/location.model';
import { Company } from 'src/app/store/company/company.model';

interface FilterAttribute {
  type: string,
  name: string,
}

interface ActiveFilter {
  id: ID;
  filterAttribute: FilterAttribute;
}

interface MaintenanceFilter {
  id: ID;
  urgency: string;
}

@Component({
  selector: 'app-maintenance-list',
  templateUrl: './maintenance-list.component.html',
  styleUrls: ['./maintenance-list.component.scss']
})
export class MaintenanceListComponent implements OnInit, OnChanges {

  @Input()
  assetsWithDetailsAndFields: AssetDetailsWithFields[];

  @Input()
  locations: Location[];
  @Input()
  companies: Company[];
  @Input()
  assetTypes: AssetType[];

  displayedAssets: AssetDetailsWithFields[];
  faFilter = faFilter;
  faPlus = faPlus;
  faTimes = faTimes;

  assetType: FilterAttribute =  { type: 'assetType', name: 'Asset Type' };
  manufacturer: FilterAttribute =  { type: 'manufacturer', name: 'Manufacturer' };
  factory: FilterAttribute =  { type: 'factory', name: 'Factory' };
  maintenanceDue: FilterAttribute =  { type: 'maintenanceDue', name: 'Maintenance Due' };

  filterOptions: FilterAttribute[] = [];
  activeFilterList: Set<ActiveFilter> = new Set();


  dashboardFilterModalTypes = DashboardFilterModalType;
  dashboardFilterTypeActice: DashboardFilterModalType;
  filterCount = 0;
  filterIdCount = 0;
  selectedAssetTypes: AssetType[] = [];
  selectedAssetTypesCount = 0;
  selectedCompanies: Company[] = [];
  selectedCompaniesCount = 0;
  selectedLocations: Location[] = [];
  selectedLocationsCount = 0;
  maintenanceValues: MaintenanceFilter[] = [{ id: 0, urgency: 'Critical (red)' },
    { id: 1, urgency: 'Soon (grey)' }, { id: 2, urgency: 'Longterm (blue)' }];
  selectedMaintenanceDue: MaintenanceFilter[] = [];
  selectedMaintenanceCount = 0;
  searchText = '';

  constructor(
  ) { }

  ngOnInit(): void {
    this.filterOptions = [this.assetType, this.manufacturer, this.factory, this.maintenanceDue];
  }

  ngOnChanges(): void {
    this.displayedAssets = this.assetsWithDetailsAndFields;
  }

  searchTextEmitted(event: string) {
    this.searchText = event;
    this.filterAssets();
  }

  addFilter() {
    const activeFilters: FilterAttribute[] = [];
    this.activeFilterList.forEach(filter => {
      activeFilters.push(filter.filterAttribute);
    })
    if (!activeFilters.includes(this.assetType)) {
      this.activeFilterList.add({ id: this.filterIdCount++ , filterAttribute: this.assetType});
    } else if (!activeFilters.includes(this.manufacturer)) {
      this.activeFilterList.add({ id: this.filterIdCount++ , filterAttribute: this.manufacturer});
    } else if (!activeFilters.includes(this.factory)) {
      this.activeFilterList.add({ id: this.filterIdCount++ , filterAttribute: this.factory});
    } else if (!activeFilters.includes(this.maintenanceDue)) {
      this.activeFilterList.add({ id: this.filterIdCount++ , filterAttribute: this.maintenanceDue});
    }
    this.filterCount++;
  }

  clearSingleFilter(filterId: ID) {
    this.activeFilterList.forEach(filter => {
      if (filter.id === filterId) {
        if (filter.filterAttribute === this.assetType) {
          this.selectedAssetTypes = [];
        } else if (filter.filterAttribute === this.manufacturer) {
          this.selectedCompanies = [];
        } else if (filter.filterAttribute === this.factory) {
          this.selectedLocations = [];
        } else if (filter.filterAttribute === this.maintenanceDue) {
          this.selectedMaintenanceDue = [];
        }
        this.activeFilterList.delete(filter)
      }
    })
    this.filterAssets();
    this.filterCount--;
  }

  clearAllFilters() {
    this.activeFilterList.clear();
    this.selectedAssetTypes = [];
    this.selectedCompanies = [];
    this.selectedLocations = [];
    this.selectedMaintenanceDue = [];
    this.filterCount = 0;
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
    const maintenanceValues = this.selectedMaintenanceDue.map(maintenanceValue => maintenanceValue.urgency)
    this.selectedAssetTypesCount = this.selectedAssetTypes.length;
    this.selectedCompaniesCount = this.selectedCompanies.length;
    this.selectedLocationsCount = this.selectedLocations.length;
    this.selectedMaintenanceCount = this.selectedMaintenanceDue.length;
    this.displayedAssets = this.assetsWithDetailsAndFields;

    if (this.searchText) {
      this.displayedAssets = this.displayedAssets.filter(asset => asset.name.toLowerCase().startsWith(this.searchText.toLowerCase()))
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
            if (maintenanceValues.includes('Critical (red)' && 'Soon (grey)')) {
              this.displayedAssets = this.displayedAssets.filter(asset => Number.parseInt(asset.videoKey, 10) < 750);
            } else if (maintenanceValues.includes('Critical (red)' && 'Longterm (blue)')) {
              this.displayedAssets = this.displayedAssets.filter(asset => Number.parseInt(asset.videoKey, 10) < 375 ||
              Number.parseInt(asset.videoKey, 10) > 750);
            } else if (maintenanceValues.includes('Soon (grey)' && 'Longterm (blue)')) {
              this.displayedAssets = this.displayedAssets.filter(asset => Number.parseInt(asset.videoKey, 10) > 375);
            }
            break;
          case 1:
            if (maintenanceValues.includes('Critical (red)')) {
              this.displayedAssets = this.displayedAssets.filter(asset => Number.parseInt(asset.videoKey, 10) < 375);
            } else if (maintenanceValues.includes('Soon (grey)')) {
              this.displayedAssets = this.displayedAssets.filter(asset => Number.parseInt(asset.videoKey, 10) > 375 &&
              Number.parseInt(asset.videoKey, 10) < 750);
            } else if (maintenanceValues.includes('Longterm (blue)')) {
              this.displayedAssets = this.displayedAssets.filter(asset => Number.parseInt(asset.videoKey, 10) > 750);
            }
            break;
        };
    }
  }
}
