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
  selector: 'app-dropdown-filter',
  templateUrl: './dropdown-filter.component.html',
  styleUrls: ['./dropdown-filter.component.scss']
})
export class DropdownFilterComponent implements OnInit {

  @Input()
  itemsToBeFiltered: any[];
  @Input()
  dropDownFilterFormGroup: FormGroup;
  @Output()
  itemsFiltered = new EventEmitter<any>();

  attributeToBeFilteredSet: Set<string> = new Set();
  checkBoxItemsSet: Set<any> = new Set();

  selectedCheckBoxItems: any[] = [];


  selectedValueMapping:
    { [k: string]: string } = {
    '=0': '# ' +  this.translate.instant('APP.SHARED.UI.TABLE_FILTER.VALUES'),
    '=1': '# ' + this.translate.instant('APP.SHARED.UI.TABLE_FILTER.VALUE'),
    other: '# ' + this.translate.instant('APP.SHARED.UI.TABLE_FILTER.VALUES')
  };

  constructor(private translate: TranslateService) {
  }

  ngOnInit(): void {
    if (this.dropDownFilterFormGroup.get('selectedCheckboxItems') !== null) {
      this.selectedCheckBoxItems = this.dropDownFilterFormGroup.get('selectedCheckboxItems').value;
    }
    this.getDropdownItems(this.dropDownFilterFormGroup.get('attributeToBeFiltered').value);
  }

  private getDropdownItems(attributeToBeFiltered) {
    this.itemsToBeFiltered.forEach(item => {
      this.attributeToBeFilteredSet.add(item[attributeToBeFiltered]);
    });
    Array.from(this.attributeToBeFilteredSet.values()).forEach((item, index) => {
      this.checkBoxItemsSet.add({ value: item, id: index });
    });
  }

  filterItemsBySelectedValues() {
    this.dropDownFilterFormGroup.get('selectedCheckboxItems').patchValue(this.selectedCheckBoxItems);

    if (this.selectedCheckBoxItems.length > 0) {
      this.dropDownFilterFormGroup.get('filteredItems').patchValue(this.itemsToBeFiltered.filter(item =>
        this.selectedCheckBoxItems.includes(item[this.dropDownFilterFormGroup.get('attributeToBeFiltered').value])));
    } else {
      this.dropDownFilterFormGroup.get('filteredItems').patchValue(this.itemsToBeFiltered);
    }

    this.itemsFiltered.emit();
  }

  clearSelectedValues() {
    this.dropDownFilterFormGroup.get('filteredItems').patchValue(this.itemsToBeFiltered);
    this.dropDownFilterFormGroup.get('selectedCheckboxItems').patchValue(null);
    this.selectedCheckBoxItems = [];
    this.itemsFiltered.emit();
  }
}
