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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { FilterOption, FilterType } from 'src/app/components/ui/table-filter/filter-options';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-table-filter',
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss']
})
export class TableFilterComponent implements OnInit {

  @Input()
  possibleFilters: FilterOption[];
  @Input()
  itemsToBeFiltered: any;
  @Input()
  position: [number, number];
  @Output()
  filteredItems = new EventEmitter<any>();

  combinedFilteredItems: any;
  filterFormMap: Map<string, FormGroup> = new Map();

  filterType = FilterType;
  activeFilterSet: Set<FilterOption> = new Set();

  filterOptions: FilterOption[] = [];
  selectedFilter: FilterOption[] = [];

  constructor(private formBuilder: FormBuilder) {
    this.changeTheme(0, 0);
  }

  faFilter = faFilter;

  ngOnInit(): void {
    this.possibleFilters.forEach(filter => {
      this.createFilterForm(filter);
      this.filterOptions.push(filter);
    });
    this.changeTheme(this.position[0], this.position[1]);
  }

  changeTheme(top: number, left: number) {
    document.documentElement.style.setProperty('--top-position', top.toString() + 'px');
    document.documentElement.style.setProperty('--left-position', left.toString() + 'px');
  }

  createFilterForm(filter: FilterOption) {
    if (filter.filterType === FilterType.DATEFILTER) {
      this.createDateFilterForm(this.formBuilder, filter);
    } else if (filter.filterType === FilterType.DROPDOWNFILTER) {
      this.createDropDownFilterForm(this.formBuilder, filter);
    }
  }

  createDateFilterForm(formBuilder: FormBuilder, filter: FilterOption) {
    this.filterFormMap.set(filter.attributeToBeFiltered, formBuilder.group({
      filterType: filter.filterType,
      attributeToBeFiltered: filter.attributeToBeFiltered,
      columnName: filter.columnName,
      filteredItems: [] as FilterOption[],
      startTimeValue: null as Date,
      endTimeValue: null as Date
    }));
  }

  createDropDownFilterForm(formBuilder: FormBuilder, filter: FilterOption) {
    this.filterFormMap.set(filter.attributeToBeFiltered, formBuilder.group({
      filterType: filter.filterType,
      attributeToBeFiltered: filter.attributeToBeFiltered,
      columnName: filter.columnName,
      filteredItems: [] as FilterOption[],
      selectedCheckboxItems: [] as any[],
    }));
  }

  addFilter() {
    this.possibleFilters.every(filter => {
      if (!this.activeFilterSet.has(filter)) {
        this.selectedFilter[this.activeFilterSet.size] = filter;
        this.activeFilterSet.add(filter);
        return false;
      }
      return true;
    });
  }

  changeSelectedFilter(oldActiveFilter: FilterOption, newActiveFilter: FilterOption) {
    if (this.activeFilterSet.has(oldActiveFilter)) {
      this.activeFilterSet.add(newActiveFilter);
      this.activeFilterSet.delete(oldActiveFilter);
    }
  }


  clearSingleFilter(filterToRemove) {
    this.activeFilterSet.delete(filterToRemove);
    this.filterFormMap.forEach(form => {
      if (form.get('attributeToBeFiltered').value === filterToRemove.attributeToBeFiltered) {
        this.clearFormValues(form);
      }
    });
    this.filterItems();
  }

  clearAllFilters() {
    this.activeFilterSet.clear();
    this.filterFormMap.forEach(form => {
      this.clearFormValues(form);
    });
    this.filterItems();
  }

  clearFormValues(form: FormGroup) {
    form.get('filteredItems').patchValue(null);
    if (form.get('filterType').value === FilterType.DATEFILTER) {
      form.get('startTimeValue').patchValue(null);
      form.get('endTimeValue').patchValue(null);
    } else if (form.get('filterType').value === FilterType.DROPDOWNFILTER) {
      form.get('selectedCheckboxItems').patchValue(null);
    }
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
