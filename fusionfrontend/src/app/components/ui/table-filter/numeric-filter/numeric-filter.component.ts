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

const SHORTTERM_PRIORITY = 'Critical (red)';
const MEDIUMTERM_PRIORITY = 'Mediumterm (grey)';
const LONGTERM_PRIORITY = 'Longterm (blue)';
// const RADIX_DECIMAL = 10;

@Component({
  selector: 'app-numeric-filter',
  templateUrl: './numeric-filter.component.html',
  styleUrls: ['./numeric-filter.component.scss']
})



export class NumericFilterComponent implements OnInit {

  readonly MAINTENANCE_HOURS_FIELD_NAME = 'Operating Hours till maintenance';
  readonly MAINTENANCE_HOURS_LOWER_THRESHOLD = 150;
  readonly MAINTENANCE_HOURS_UPPER_THRESHOLD = 750;
  readonly MAINTENANCE_HOURS_OVERSHOOTING_LIMIT = 1500;

  readonly MAINTENANCE_DAYS_FIELD_NAME = 'Days till maintenance';
  readonly MAINTENANCE_DAYS_LOWER_THRESHOLD = 90;
  readonly MAINTENANCE_DAYS_UPPER_THRESHOLD = 180;
  readonly MAINTENANCE_DAYS_OVERSHOOTING_LIMIT = 365;

  @Input()
  itemsToBeFiltered: any;
  @Input()
  numericFilterFormGroup: FormGroup;
  @Output()
  itemsFiltered = new EventEmitter<any>();

  checkBoxItemsArray = [
    { id: "0", value: SHORTTERM_PRIORITY } ,
    { id: "1", value: MEDIUMTERM_PRIORITY } ,
    { id: "2", value: LONGTERM_PRIORITY }
  ];
  selectedCheckBoxItems: any[] = [];
  filteredItems: [] = [];
  index: number;


  //   [{ value: SHORTTERM_PRIORITY, id: 0 }, { value: MEDIUMTERM_PRIORITY, id: 1 }, { value: LONGTERM_PRIORITY, id: 2 }];

  selectedValueMapping:
    { [k: string]: string } = { '=0': '# Values', '=1': '# Value', other: '# Values' };

  constructor() { }

  ngOnInit(): void {
    console.log(this.itemsToBeFiltered);
    if (this.numericFilterFormGroup.get('selectedCheckboxItems') !== null) {
      this.selectedCheckBoxItems = this.numericFilterFormGroup.get('selectedCheckboxItems').value;
    }
  }

  filterItemsBySelectedValues() {
    console.log(this.selectedCheckBoxItems)

    this.numericFilterFormGroup.get('selectedCheckboxItems').patchValue(this.selectedCheckBoxItems);

    if (this.selectedCheckBoxItems.length > 0) {
      this.filteredItems = this.itemsToBeFiltered;

      // this.selectedCheckBoxItems.forEach(item => {
      //   this.filterItems(item);
      // });

      this.numericFilterFormGroup.get('filteredItems').patchValue(this.itemsToBeFiltered);
    } else {
      this.numericFilterFormGroup.get('filteredItems').patchValue(this.itemsToBeFiltered);
    }
    // this.itemsFiltered.emit();



    // if (this.selectedCheckBoxItems.length > 0) {
    //   this.numericFilterFormGroup.get('filteredItems').patchValue(this.itemsToBeFiltered.filter(item =>
    //     this.selectedCheckBoxItems.includes(item[this.numericFilterFormGroup.get('attributeToBeFiltered').value])));
    // } else {
    //   this.numericFilterFormGroup.get('filteredItems').patchValue(this.itemsToBeFiltered);
    // }
  }

  // filterItems(item: any) {
    // this.filteredItems = this.itemsToBeFiltered.filter(asset => {
    //   this.index = asset.fields.findIndex(field => field.name === this.MAINTENANCE_DAYS_FIELD_NAME);
    //   if (this.index !== -1) {
    //     return Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) < value;
    //   }
    // });
  // }


  clearSelectedValues() {
    this.numericFilterFormGroup.get('filteredItems').patchValue(this.itemsToBeFiltered);
    this.numericFilterFormGroup.get('selectedCheckboxItems').patchValue(null);
    this.selectedCheckBoxItems = [];
    this.itemsFiltered.emit();
  }
}



// filterAssetsByTwoMaintenanceValues() {
//   if (this.selectedMaintenanceDue.includes(SHORTTERM_PRIORITY) && this.selectedMaintenanceDue.includes(MEDIUMTERM_PRIORITY)) {
//     this.filterAssetsLowerThanMaintenanceValue(this.MAINTENANCE_DAYS_UPPER_THRESHOLD);
//   } else if (this.selectedMaintenanceDue.includes(SHORTTERM_PRIORITY) && this.selectedMaintenanceDue.includes(LONGTERM_PRIORITY)) {
//     this.filterAssetOutsideTwoMaintenanceValues(this.MAINTENANCE_DAYS_LOWER_THRESHOLD, this.MAINTENANCE_DAYS_UPPER_THRESHOLD);
//   } else if (this.selectedMaintenanceDue.includes(MEDIUMTERM_PRIORITY) && this.selectedMaintenanceDue.includes(LONGTERM_PRIORITY)) {
//     this.filterAssetsGreaterThanMaintenanceValue(this.MAINTENANCE_DAYS_LOWER_THRESHOLD);
//   }
// }
//
// filterAssetsByOneMaintenanceValue() {
//   if (this.selectedMaintenanceDue.includes(SHORTTERM_PRIORITY)) {
//     this.filterAssetsLowerThanMaintenanceValue(this.MAINTENANCE_DAYS_LOWER_THRESHOLD);
//   } else if (this.selectedMaintenanceDue.includes(MEDIUMTERM_PRIORITY)) {
//     this.filterAssetsBetweenTwoMaintenanceValues(this.MAINTENANCE_DAYS_LOWER_THRESHOLD, this.MAINTENANCE_DAYS_UPPER_THRESHOLD);
//   } else if (this.selectedMaintenanceDue.includes(LONGTERM_PRIORITY)) {
//     this.filterAssetsGreaterThanMaintenanceValue(this.MAINTENANCE_DAYS_UPPER_THRESHOLD);
//   }
// }
//
// filterAssetsLowerThanMaintenanceValue(value: number) {
//   this.displayedFactoryAssets = this.displayedFactoryAssets.filter(asset => {
//     this.index = asset.fields.findIndex(field => field.name === this.MAINTENANCE_DAYS_FIELD_NAME);
//     if (this.index !== -1) {
//       return Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) < value;
//     }
//   });
// }
//
// filterAssetsGreaterThanMaintenanceValue(value: number) {
//   this.displayedFactoryAssets = this.displayedFactoryAssets.filter(asset => {
//     this.index = asset.fields.findIndex(field => field.name === this.MAINTENANCE_DAYS_FIELD_NAME);
//     if (this.index !== -1) {
//       return Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) > value;
//     }
//   });
// }
//
// filterAssetOutsideTwoMaintenanceValues(lowerValue: number, greaterValue: number) {
//   this.displayedFactoryAssets = this.displayedFactoryAssets.filter(asset => {
//     this.index = asset.fields.findIndex(field => field.name === this.MAINTENANCE_DAYS_FIELD_NAME);
//     if (this.index !== -1) {
//       return Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) < lowerValue ||
//         Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) > greaterValue;
//     }
//   });
// }
//
// filterAssetsBetweenTwoMaintenanceValues(lowerValue: number, greaterValue: number) {
//   this.displayedFactoryAssets = this.displayedFactoryAssets.filter(asset => {
//     this.index = asset.fields.findIndex(field => field.name === this.MAINTENANCE_DAYS_FIELD_NAME);
//     if (this.index !== -1) {
//       return Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) < greaterValue &&
//         Number.parseInt(asset.fields[this.index].value, RADIX_DECIMAL) > lowerValue;
//     }
//   });
// }
//
