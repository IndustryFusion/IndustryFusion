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
  selector: 'app-date-filter',
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss']
})
export class DateFilterComponent implements OnInit {

  @Input()
  itemsToBeFiltered: any[];
  @Input()
  dateFilterFormGroup: FormGroup;
  @Output()
  itemsFiltered = new EventEmitter<any>();

  selectedValueMapping:
    { [k: string]: string } = { '=0': '# Values', '=1': '# Value', other: '# Values' };

  constructor() { }

  ngOnInit(): void {  }


  filterItemsByTimestemp() {
    const startTimestamp = this.dateFilterFormGroup.get('startTimeValue').value;
    const endTimestamp = this.dateFilterFormGroup.get('endTimeValue').value;
    const attributeToBeFiltered = this.dateFilterFormGroup.get('attributeToBeFiltered').value;

    const filteredItems = this.filterLowerLimit(startTimestamp, attributeToBeFiltered).filter(item =>
          this.filterUpperLimit(endTimestamp, attributeToBeFiltered).includes(item));

    this.dateFilterFormGroup.get('filteredItems').patchValue(filteredItems);

    this.itemsFiltered.emit();
  }

  private filterLowerLimit(lowerLimitValue, attributeToBeFiltered) {
    return lowerLimitValue ? this.itemsToBeFiltered.filter(item => item[attributeToBeFiltered]
      > lowerLimitValue) : this.itemsToBeFiltered;
  }

  private filterUpperLimit(upperLimitValue, attributeToBeFiltered) {
    return upperLimitValue ? this.itemsToBeFiltered.filter(item => item[attributeToBeFiltered]
      < upperLimitValue) : this.itemsToBeFiltered;
  }

  clearSelectFilterValues() {
    this.dateFilterFormGroup.get('startTimeValue').patchValue(null);
    this.dateFilterFormGroup.get('endTimeValue').patchValue(null);
    this.dateFilterFormGroup.get('filteredItems').patchValue(null);

    this.itemsFiltered.emit();
  }
}
