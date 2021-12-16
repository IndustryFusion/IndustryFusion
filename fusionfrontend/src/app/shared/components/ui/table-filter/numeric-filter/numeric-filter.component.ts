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
import { TranslateService } from '@ngx-translate/core';



@Component({
  selector: 'app-numeric-filter',
  templateUrl: './numeric-filter.component.html',
  styleUrls: ['./numeric-filter.component.scss']
})
export class NumericFilterComponent implements OnInit {

  readonly MAINTENANCE_DAYS_FIELD_NAME = 'Days till maintenance';
  readonly MAINTENANCE_DAYS_LOWER_THRESHOLD = 90;
  readonly MAINTENANCE_DAYS_UPPER_THRESHOLD = 180;

  readonly MAINTENANCE_HOURS_FIELD_NAME = 'Operating Hours till maintenance';
  readonly MAINTENANCE_HOURS_LOWER_THRESHOLD = 150;
  readonly MAINTENANCE_HOURS_UPPER_THRESHOLD = 750;

  readonly SHORTTERM_PRIORITY = this.translate.instant('APP.SHARED.UI.TABLE_FILTER.NUMERIC_FILTER.SHORT_TERM_PRIORITY');
  readonly MEDIUMTERM_PRIORITY = this.translate.instant('APP.SHARED.UI.TABLE_FILTER.NUMERIC_FILTER.MEDIUM_TERM_PRIORITY');
  readonly LONGTERM_PRIORITY = this.translate.instant('APP.SHARED.UI.TABLE_FILTER.NUMERIC_FILTER.LONG_TERM_PRIORITY');

  @Input()
  itemsToBeFiltered: any[];
  @Input()
  numericFilterFormGroup: FormGroup;
  @Output()
  itemsFiltered = new EventEmitter<any>();

  checkBoxItemsSet: Set<any> = new Set();
  checkBoxItems: string[] = [this.SHORTTERM_PRIORITY, this.MEDIUMTERM_PRIORITY, this.LONGTERM_PRIORITY];
  selectedCheckBoxItems: any[] = [];
  filteredItems: Set<any> = new Set();
  filteredItemsByMaintenanceHours: any[] = [];
  filteredItemsByMaintenanceDays: any[] = [];
  index: number;

  selectedValueMapping:
    { [k: string]: string } = {
    '=0': '# ' +  this.translate.instant('APP.SHARED.UI.TABLE_FILTER.VALUES'),
    '=1': '# ' + this.translate.instant('APP.SHARED.UI.TABLE_FILTER.VALUE'),
    other: '# ' + this.translate.instant('APP.SHARED.UI.TABLE_FILTER.VALUES')
  };

  constructor(private translate: TranslateService) { }

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
    this.filteredItemsByMaintenanceDays = this.itemsToBeFiltered;
    this.filteredItemsByMaintenanceHours = this.itemsToBeFiltered;
    this.numericFilterFormGroup.get('selectedCheckboxItems').patchValue(this.selectedCheckBoxItems);
    if (this.selectedCheckBoxItems.length > 0) {
      this.checkBoxItems.forEach(checkBoxValue => {
        this.filteredItemsByMaintenanceDays = this.selectedCheckBoxItems.includes(checkBoxValue) ? this.filteredItemsByMaintenanceDays :
          this.filterItems(checkBoxValue, this.MAINTENANCE_DAYS_FIELD_NAME).filter(item =>
            this.filteredItemsByMaintenanceDays.includes(item));
        this.filteredItemsByMaintenanceHours = this.selectedCheckBoxItems.includes(checkBoxValue) ? this.filteredItemsByMaintenanceHours :
          this.filterItems(checkBoxValue, this.MAINTENANCE_HOURS_FIELD_NAME).filter(item =>
            this.filteredItemsByMaintenanceHours.includes(item));
      });
      this.filteredItems = new Set(this.filteredItemsByMaintenanceDays.concat(this.filteredItemsByMaintenanceHours));
      this.numericFilterFormGroup.get('filteredItems').patchValue(Array.from(this.filteredItems));

    } else {
      this.numericFilterFormGroup.get('filteredItems').patchValue(this.itemsToBeFiltered);
    }
    this.itemsFiltered.emit();
  }

  filterItems(checkboxItem: string, fieldName: string) {
    const attributeToBeFiltered = 'fields';
    switch (checkboxItem) {
      case this.SHORTTERM_PRIORITY: {
        if (fieldName === this.MAINTENANCE_DAYS_FIELD_NAME) {
          return this.removeAboveThreshold(this.MAINTENANCE_DAYS_LOWER_THRESHOLD, attributeToBeFiltered,
            this.MAINTENANCE_DAYS_FIELD_NAME);
        } else if (fieldName === this.MAINTENANCE_HOURS_FIELD_NAME) {
          return this.removeAboveThreshold(this.MAINTENANCE_HOURS_LOWER_THRESHOLD, attributeToBeFiltered,
            this.MAINTENANCE_HOURS_FIELD_NAME);
        }
        break;
      }
      case this.MEDIUMTERM_PRIORITY: {
        if (fieldName === this.MAINTENANCE_DAYS_FIELD_NAME) {
          return this.removeBelowThreshold(this.MAINTENANCE_DAYS_LOWER_THRESHOLD, attributeToBeFiltered, this.MAINTENANCE_DAYS_FIELD_NAME)
            .concat(this.removeAboveThreshold(this.MAINTENANCE_DAYS_UPPER_THRESHOLD, attributeToBeFiltered),
              this.MAINTENANCE_DAYS_FIELD_NAME);
        } else if (fieldName === this.MAINTENANCE_HOURS_FIELD_NAME) {
          return this.removeBelowThreshold(this.MAINTENANCE_HOURS_LOWER_THRESHOLD, attributeToBeFiltered, this.MAINTENANCE_HOURS_FIELD_NAME)
            .concat(this.removeAboveThreshold(this.MAINTENANCE_HOURS_UPPER_THRESHOLD, attributeToBeFiltered,
              this.MAINTENANCE_HOURS_FIELD_NAME));
        }
        break;
      }
      case this.LONGTERM_PRIORITY: {
        if (fieldName === this.MAINTENANCE_DAYS_FIELD_NAME) {
          return this.removeBelowThreshold(this.MAINTENANCE_DAYS_UPPER_THRESHOLD, attributeToBeFiltered,
            this.MAINTENANCE_DAYS_FIELD_NAME);
        } else if (fieldName === this.MAINTENANCE_HOURS_FIELD_NAME) {
          return this.removeBelowThreshold(this.MAINTENANCE_HOURS_UPPER_THRESHOLD, attributeToBeFiltered,
            this.MAINTENANCE_HOURS_FIELD_NAME);
        }
        break;
      }
    }
  }

  private removeBelowThreshold(lowerLimitValue: number, attributeToBeFiltered: string, fieldName?: string) {
    return this.itemsToBeFiltered.filter(item => {
      const fields: any[] = item[attributeToBeFiltered];
      this.index = fields.findIndex(field => field.name === fieldName);

      if (this.index !== -1 && fields[this.index].value !== null) {
        return fields[this.index].value < lowerLimitValue;
      }
      return false;
    });
  }

  private removeAboveThreshold(upperLimitValue: number, attributeToBeFiltered: string, fieldName?: string) {
    return this.itemsToBeFiltered.filter(item => {
      const fields: any[] = item[attributeToBeFiltered];
      this.index = fields.findIndex(field => field.name === fieldName);

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
