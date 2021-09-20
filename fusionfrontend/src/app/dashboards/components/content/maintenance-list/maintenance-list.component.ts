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
import { FactoryAssetDetailsWithFields } from 'src/app/store/factory-asset-details/factory-asset-details.model';
import { AssetType } from 'src/app/store/asset-type/asset-type.model';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { Company } from 'src/app/store/company/company.model';
import { OispAlertPriority } from 'src/app/store/oisp-alert/oisp-alert.model';
import { FilterOption, FilterType } from '../../../../components/ui/table-filter/filter-options';


export enum MaintenanceState { CRITICAL, MEDIUMTERM, LONGTERM }

@Component({
  selector: 'app-maintenance-list',
  templateUrl: './maintenance-list.component.html',
  styleUrls: ['./maintenance-list.component.scss']
})
export class MaintenanceListComponent implements OnInit, OnChanges {

  readonly MAINTENANCE_HIGHLIGHT_PERCENTAGE = 25;

  readonly MAINTENANCE_HOURS_FIELD_NAME = 'Operating Hours till maintenance';
  readonly MAINTENANCE_HOURS_LOWER_THRESHOLD = 150;
  readonly MAINTENANCE_HOURS_UPPER_THRESHOLD = 750;
  readonly MAINTENANCE_HOURS_OVERSHOOTING_LIMIT = 1500;

  readonly MAINTENANCE_DAYS_FIELD_NAME = 'Days till maintenance';
  readonly MAINTENANCE_DAYS_LOWER_THRESHOLD = 90;
  readonly MAINTENANCE_DAYS_UPPER_THRESHOLD = 180;
  readonly MAINTENANCE_DAYS_OVERSHOOTING_LIMIT = 365;

  @Input()
  factoryAssetDetailsWithFields: FactoryAssetDetailsWithFields[];
  @Input()
  factorySites: FactorySite[];
  @Input()
  companies: Company[];
  @Input()
  assetTypes: AssetType[];

  displayedFactoryAssets: Array<FactoryAssetDetailsWithFields> = [];
  searchedFactoryAssets: Array<FactoryAssetDetailsWithFields> = [];
  filteredFactoryAssets: Array<FactoryAssetDetailsWithFields> = [];

  OispPriority = OispAlertPriority;

  searchText = '';

  possibleFilters: FilterOption[] = [{ filterType: FilterType.DROPDOWNFILTER, columnName: 'Asset Type', attributeToBeFiltered: 'category' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Manufacturer', attributeToBeFiltered: 'manufacturer' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Factory', attributeToBeFiltered: 'factorySiteName'},
    { filterType: FilterType.NUMBERBASEDFILTER, columnName: 'Maintenance Due (Days)', attributeToBeFiltered: 'maintenanceDue'}];

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.displayedFactoryAssets = this.searchedFactoryAssets = this.filteredFactoryAssets = this.factoryAssetDetailsWithFields;
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
  }

  public getMaintenanceHoursValue(asset: FactoryAssetDetailsWithFields): number {
    return +asset.fields.find(field => field.name === this.MAINTENANCE_HOURS_FIELD_NAME)?.value;
  }

  public getMaintenanceHoursPercentage(asset: FactoryAssetDetailsWithFields): number {
    return this.getMaintenanceHoursValue(asset) / this.MAINTENANCE_HOURS_OVERSHOOTING_LIMIT * 100;
  }

  public getMaintenanceDaysValue(asset: FactoryAssetDetailsWithFields): number {
    return +asset.fields.find(field => field.name === this.MAINTENANCE_DAYS_FIELD_NAME)?.value;
  }

  public getMaintenanceDaysPercentage(asset: FactoryAssetDetailsWithFields): number {
    return this.getMaintenanceDaysValue(asset) / this.MAINTENANCE_DAYS_OVERSHOOTING_LIMIT * 100;
  }

  public isMaintenanceNeededSoon(asset: FactoryAssetDetailsWithFields): boolean {
    return (this.getMaintenanceHoursValue(asset) && this.getMaintenanceHoursPercentage(asset) < this.MAINTENANCE_HIGHLIGHT_PERCENTAGE) ||
      (this.getMaintenanceDaysValue(asset) && this.getMaintenanceDaysPercentage(asset) < this.MAINTENANCE_HIGHLIGHT_PERCENTAGE);
  }

  public getMaintenanceState(value: number, lowerThreshold: number, upperThreshold: number): MaintenanceState {
    if (value < lowerThreshold) {
      return MaintenanceState.CRITICAL;
    } else if (value < upperThreshold) {
      return MaintenanceState.MEDIUMTERM;
    }
    return MaintenanceState.LONGTERM;
  }
}
