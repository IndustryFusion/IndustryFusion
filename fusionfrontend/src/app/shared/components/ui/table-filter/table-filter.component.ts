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

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { FilterOption, FilterType } from 'src/app/shared/components/ui/table-filter/filter-options';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StatusWithAssetId } from '../../../../factory/models/status.model';
import { StatusFilterComponent } from './status-filter/status-filter.component';
import { OispDeviceStatus } from '../../../../core/models/kairos.model';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-table-filter',
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss']
})
export class TableFilterComponent implements OnInit, OnChanges {

  @Input()
  tableFilters: FilterOption[];
  @Input()
  itemsToBeFiltered: any;
  @Input()
  statusesWithAssetId: StatusWithAssetId[];
  @Input()
  defaultStatusFilter: OispDeviceStatus = undefined;
  @Output()
  filteredItems = new EventEmitter<any>();

  hasPositionSet = false;

  combinedFilteredItems: any;
  filterFormMap: Map<string, FormGroup> = new Map();

  filterType = FilterType;
  activeFilterSet: Set<FilterOption> = new Set();

  filterOptions: FilterOption[] = [];
  selectedFilter: FilterOption[] = [];

  faFilter = faFilter;

  private previousStatusesWithAssetIdSorted: StatusWithAssetId[];

  constructor(private formBuilder: FormBuilder,
              private translate: TranslateService) {
  }

  private static clearFormValues(form: FormGroup) {
    form.get('filteredItems').patchValue(null);
    if (form.get('filterType').value === FilterType.DATEFILTER) {
      form.get('startTimeValue').patchValue(null);
      form.get('endTimeValue').patchValue(null);
    } else if (form.get('filterType').value === FilterType.DROPDOWNFILTER) {
      form.get('selectedCheckboxItems').patchValue(null);
    } else if (form.get('filterType').value === FilterType.STATUSFILTER) {
      form.get('selectedCheckboxItems').patchValue(null);
    }
  }

  ngOnInit() {
    StatusFilterComponent.preInitStaticAttributes(this.translate);

    this.tableFilters.forEach(filter => {
      this.createFilterForm(filter);
      this.filterOptions.push(filter);
    });

    const statusSorted = this.statusesWithAssetId?.sort((a, b) => a.factoryAssetId as number - (b.factoryAssetId as number));
    this.previousStatusesWithAssetIdSorted = this.statusesWithAssetId ? [...statusSorted] : null;

    this.addDefaultStatusFilterIfProvided();
  }

  private addDefaultStatusFilterIfProvided() {
    if (this.defaultStatusFilter) {
      const newActiveStatusFilter: FilterOption = this.tableFilters.find(filter => filter.filterType === FilterType.STATUSFILTER);
      this.selectedFilter[this.activeFilterSet.size] = newActiveStatusFilter;
      this.activeFilterSet.add(newActiveStatusFilter);

      const selectedStatusValue = this.translate.instant(`APP.COMMON.STATUSES.${this.defaultStatusFilter}`);
      this.filterFormMap.get('status').get('selectedCheckboxItems').patchValue([selectedStatusValue]);

      StatusFilterComponent.enableFilter();
      this.filterItemsByStatus();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (StatusFilterComponent.isFilterEnabled() && changes.statusesWithAssetId && this.statusesWithAssetId) {
      this.filterItemsByStatus();
    }
  }

  private filterItemsByStatus() {
    let changesToPrevious = this.previousStatusesWithAssetIdSorted?.length !== this.statusesWithAssetId.length;

    const statusSorted = this.statusesWithAssetId.sort((a, b) => a.factoryAssetId as number - (b.factoryAssetId as number));
    for (let i = 0; i < this.statusesWithAssetId.length && !changesToPrevious; i++) {
       if (statusSorted[i].status.value !== this.previousStatusesWithAssetIdSorted[i].status.value
         || statusSorted[i].factoryAssetId !== this.previousStatusesWithAssetIdSorted[i].factoryAssetId) {
         changesToPrevious = true;
       }
    }

    if (changesToPrevious) {
      this.previousStatusesWithAssetIdSorted = [...statusSorted];
      StatusFilterComponent.applyFilter(this.filterFormMap.get('status'), this.itemsToBeFiltered, this.statusesWithAssetId);
      this.filterItems();
    }
  }


  private createFilterForm(filter: FilterOption) {
    if (filter.filterType === FilterType.DATEFILTER) {
      this.createDateFilterForm(this.formBuilder, filter);
    } else if (filter.filterType === FilterType.DROPDOWNFILTER) {
      this.createDropDownFilterForm(this.formBuilder, filter);
    } else if (filter.filterType === FilterType.NUMBERBASEDFILTER) {
      this.createNumericFilterForm(this.formBuilder, filter);
    } else if (filter.filterType === FilterType.STATUSFILTER) {
      this.createStatusFilterForm(this.formBuilder, filter);
    }
  }

  private createDateFilterForm(formBuilder: FormBuilder, filter: FilterOption) {
    this.filterFormMap.set(filter.attributeToBeFiltered, formBuilder.group({
      filterType: filter.filterType,
      attributeToBeFiltered: filter.attributeToBeFiltered,
      columnName: filter.columnName,
      filteredItems: [] as FilterOption[],
      startTimeValue: null as Date,
      endTimeValue: null as Date
    }));
  }

  private createDropDownFilterForm(formBuilder: FormBuilder, filter: FilterOption) {
    this.filterFormMap.set(filter.attributeToBeFiltered, formBuilder.group({
      filterType: filter.filterType,
      attributeToBeFiltered: filter.attributeToBeFiltered,
      columnName: filter.columnName,
      filteredItems: [] as FilterOption[],
      selectedCheckboxItems: [] as any[],
    }));
  }

  private createNumericFilterForm(formBuilder: FormBuilder, filter: FilterOption) {
    this.filterFormMap.set(filter.attributeToBeFiltered, formBuilder.group({
      filterType: filter.filterType,
      attributeToBeFiltered: filter.attributeToBeFiltered,
      columnName: filter.columnName,
      filteredItems: [] as FilterOption[],
      selectedCheckboxItems: [] as any[],
    }));
  }

  private createStatusFilterForm(formBuilder: FormBuilder, filter: FilterOption) {
    this.filterFormMap.set(filter.attributeToBeFiltered, formBuilder.group({
      filterType: filter.filterType,
      attributeToBeFiltered: filter.attributeToBeFiltered,
      columnName: filter.columnName,
      filteredItems: [] as FilterOption[],
      selectedCheckboxItems: [] as any[],
    }));
  }

  addFilter() {
    for (const filter of this.tableFilters) {
      if (!this.activeFilterSet.has(filter)) {
        this.selectedFilter[this.activeFilterSet.size] = filter;
        this.activeFilterSet.add(filter);
        break;
      }
    }
  }

  changeSelectedFilter(oldActiveFilter: FilterOption, newActiveFilter: FilterOption) {
    if (this.activeFilterSet.has(oldActiveFilter)) {
      this.activeFilterSet.add(newActiveFilter);
      this.activeFilterSet.delete(oldActiveFilter);

      if (oldActiveFilter.filterType === FilterType.STATUSFILTER) {
        StatusFilterComponent.disableFilter();
      }
    }
  }

  clearSingleFilter(filterToRemove: FilterOption) {
    this.activeFilterSet.delete(filterToRemove);
    this.filterFormMap.forEach(form => {
      if (form.get('attributeToBeFiltered').value === filterToRemove.attributeToBeFiltered) {
        TableFilterComponent.clearFormValues(form);
      }
    });

    if (filterToRemove.filterType === FilterType.STATUSFILTER) {
      StatusFilterComponent.disableFilter();
    }
    this.filterItems();
  }

  clearAllFilters() {
    this.activeFilterSet.clear();
    this.filterFormMap.forEach(form => {
      TableFilterComponent.clearFormValues(form);
    });
    StatusFilterComponent.disableFilter();
    this.filterItems();
  }

  filterItems() {
    this.combinedFilteredItems = this.itemsToBeFiltered;

    this.filterFormMap.forEach(form => {
      if (form.get('filteredItems').value !== null) {
        this.combinedFilteredItems = this.combinedFilteredItems.filter(item =>
          form.get('filteredItems').value.includes(item));
      }
    });
    this.filteredItems.emit(this.combinedFilteredItems);
  }
}
