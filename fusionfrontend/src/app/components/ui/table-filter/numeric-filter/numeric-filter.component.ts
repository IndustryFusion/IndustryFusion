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
import { FormGroup } from '@angular/forms';



@Component({
  selector: 'app-numeric-filter',
  templateUrl: './numeric-filter.component.html',
  styleUrls: ['./numeric-filter.component.scss']
})
export class NumericFilterComponent implements OnInit {

  readonly MAINTENANCE_DAYS_FIELD_NAME = 'Days till maintenance';
  readonly MAINTENANCE_DAYS_LOWER_THRESHOLD = 90;
  readonly MAINTENANCE_DAYS_UPPER_THRESHOLD = 180;

  readonly SHORTTERM_PRIORITY = 'Critical (red)';
  readonly MEDIUMTERM_PRIORITY = 'Mediumterm (grey)';
  readonly LONGTERM_PRIORITY = 'Longterm (blue)';

  @Input()
  itemsToBeFiltered: any;
  @Input()
  numericFilterFormGroup: FormGroup;
  @Output()
  itemsFiltered = new EventEmitter<any>();

  checkBoxItemsSet: Set<any> = new Set();
  checkBoxItems: string[] = [this.SHORTTERM_PRIORITY, this.MEDIUMTERM_PRIORITY, this.LONGTERM_PRIORITY];
  selectedCheckBoxItems: any[] = [];
  filteredItems: any[] = [];
  index: number;

  selectedValueMapping:
    { [k: string]: string } = { '=0': '# Values', '=1': '# Value', other: '# Values' };

  constructor() { }

  ngOnInit(): void {
    this.checkBoxItems.forEach((item, index) => {
      this.checkBoxItemsSet.add({ value: item, id: index });
    });
    if (this.numericFilterFormGroup.get('selectedCheckboxItems') !== null) {
      this.selectedCheckBoxItems = this.numericFilterFormGroup.get('selectedCheckboxItems').value;
    } else {
      this.selectedCheckBoxItems = [];
    }
  }

  filterItemsBySelectedValues() {
    this.filteredItems = this.itemsToBeFiltered;
    this.numericFilterFormGroup.get('selectedCheckboxItems').patchValue(this.selectedCheckBoxItems);
    if (this.selectedCheckBoxItems.length > 0) {
      this.checkBoxItems.forEach(checkBoxValue => {
        this.filteredItems = this.selectedCheckBoxItems.includes(checkBoxValue) ? this.filteredItems :
          this.filterItems(checkBoxValue).filter(item => this.filteredItems.includes(item));
      });
      this.numericFilterFormGroup.get('filteredItems').patchValue(this.filteredItems);
    } else {
      this.numericFilterFormGroup.get('filteredItems').patchValue(this.itemsToBeFiltered);
    }
    this.itemsFiltered.emit();
  }

  filterItems(checkboxItem: string) {
    const attributeToBeFiltered = 'fields';
    switch (checkboxItem) {
      case this.SHORTTERM_PRIORITY: {
        return this.removeAboveThreshold(this.MAINTENANCE_DAYS_LOWER_THRESHOLD, attributeToBeFiltered);
      }
      case this.MEDIUMTERM_PRIORITY: {
        return this.removeBelowThreshold(this.MAINTENANCE_DAYS_LOWER_THRESHOLD, attributeToBeFiltered)
          .concat(this.removeAboveThreshold(this.MAINTENANCE_DAYS_UPPER_THRESHOLD, attributeToBeFiltered));
      }
      case this.LONGTERM_PRIORITY: {
        return this.removeBelowThreshold(this.MAINTENANCE_DAYS_UPPER_THRESHOLD, attributeToBeFiltered);
      }
    }
  }

  private removeBelowThreshold(lowerLimitValue, attributeToBeFiltered) {
    return this.itemsToBeFiltered.filter(item => {
      const fields: any[] = item[attributeToBeFiltered];
      this.index = fields.findIndex(field => field.name === this.MAINTENANCE_DAYS_FIELD_NAME);

      if (this.index !== -1 && fields[this.index].value !== null) {
        return fields[this.index].value < lowerLimitValue;
      }
      return false;
    });
  }

  private removeAboveThreshold(upperLimitValue, attributeToBeFiltered) {
    return this.itemsToBeFiltered.filter(item => {
      const fields: any[] = item[attributeToBeFiltered];
      this.index = fields.findIndex(field => field.name === this.MAINTENANCE_DAYS_FIELD_NAME);
      if (this.index !== -1 && fields[this.index].value !== null) {
        return fields[this.index].value > upperLimitValue;
      }
      return false;
    });
  }

  clearSelectedValues() {
    this.numericFilterFormGroup.get('filteredItems').patchValue(this.itemsToBeFiltered);
    this.numericFilterFormGroup.get('selectedCheckboxItems').patchValue(null);
    this.selectedCheckBoxItems = [];
    this.itemsFiltered.emit();
  }
}