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
import { StatusWithAssetId } from '../../../../factory/models/status.model';

@Component({
  selector: 'app-status-filter',
  templateUrl: './status-filter.component.html',
  styleUrls: ['./status-filter.component.scss']
})
export class StatusFilterComponent implements OnInit {

  @Input()
  itemsToBeFiltered: any[];
  @Input()
  statusesWithAssetId: StatusWithAssetId[];
  @Input()
  statusFilterFormGroup: FormGroup;
  @Output()
  itemsFiltered = new EventEmitter<any>();

  checkBoxItemsSet: Set<any> = new Set();
  checkBoxItems: string[] = ['Offline', 'Idle', 'Running', 'Error'];

  selectedCheckBoxItems: any[] = [];


  selectedValueMapping:
    { [k: string]: string } = { '=0': '# Values', '=1': '# Value', other: '# Values' };

  constructor() {
  }

  ngOnInit(): void {
    if (this.statusFilterFormGroup.get('selectedCheckboxItems') !== null) {
      this.selectedCheckBoxItems = this.statusFilterFormGroup.get('selectedCheckboxItems').value;
    }
    this.getStatusValues();
  }

  private getStatusValues() {
    this.checkBoxItems.forEach((item, index) => {
      this.checkBoxItemsSet.add({ value: item, id: index });
    });
  }

  filterItemsBySelectedValues() {
    this.statusFilterFormGroup.get('selectedCheckboxItems').patchValue(this.selectedCheckBoxItems);

    if (this.selectedCheckBoxItems.length > 0) {
      this.statusFilterFormGroup.get('filteredItems').patchValue(
        this.itemsToBeFiltered.filter(itemToBeFiltered => {
          return this.statusesWithAssetId.filter(statusWithAssetId => statusWithAssetId.status.statusValue === null ?
            this.selectedCheckBoxItems.includes(this.checkBoxItems[0]) : this.selectedCheckBoxItems
              .includes(this.checkBoxItems[statusWithAssetId.status.statusValue]))
            .map(statusWithAssetId => statusWithAssetId.factoryAssetId).includes(itemToBeFiltered.id);
        })
      );
    } else {
      this.statusFilterFormGroup.get('filteredItems').patchValue(this.itemsToBeFiltered);
    }

    this.itemsFiltered.emit();
  }

  clearSelectedValues() {
    this.statusFilterFormGroup.get('filteredItems').patchValue(this.itemsToBeFiltered);
    this.statusFilterFormGroup.get('selectedCheckboxItems').patchValue(null);
    this.selectedCheckBoxItems = [];
    this.itemsFiltered.emit();
  }
}

