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
import { StatusWithAssetId } from '../../../../../factory/models/status.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-status-filter',
  templateUrl: './status-filter.component.html',
  styleUrls: ['./status-filter.component.scss']
})
export class StatusFilterComponent implements OnInit {
  private static checkBoxItems: string[];
  private static isEnabled;

  @Input()
  itemsToBeFiltered: any[];
  @Input()
  statusesWithAssetId: StatusWithAssetId[];
  @Input()
  statusFilterFormGroup: FormGroup;
  @Output()
  itemsFiltered = new EventEmitter<any>();

  checkBoxItemsSet: Set<any> = new Set();
  selectedValueMapping:
    { [k: string]: string } = {
    '=0': '# ' +  this.translate.instant('APP.SHARED.UI.TABLE_FILTER.VALUES'),
    '=1': '# ' + this.translate.instant('APP.SHARED.UI.TABLE_FILTER.VALUE'),
    other: '# ' + this.translate.instant('APP.SHARED.UI.TABLE_FILTER.VALUES')
  };

  selectedCheckBoxItems: any[] = [];

  constructor(private translate: TranslateService) {
  }

  public static isFilterEnabled(): boolean {
    return StatusFilterComponent.isEnabled;
  }

  public static disableFilter(): void {
    StatusFilterComponent.isEnabled = false;
  }

  public static enableFilter(): void {
    StatusFilterComponent.isEnabled = true;
  }

  public static preInitStaticAttributes(translate: TranslateService) {
    StatusFilterComponent.checkBoxItems = [
      translate.instant('APP.COMMON.STATUSES.OFFLINE'),
      translate.instant('APP.COMMON.STATUSES.IDLE'),
      translate.instant('APP.COMMON.STATUSES.RUNNING'),
      translate.instant('APP.COMMON.STATUSES.ERROR'),
    ];
  }

  public static applyFilter(statusFilterFormGroup: FormGroup, itemsToBeFiltered: any, statusesWithAssetId: StatusWithAssetId[]) {
    const selectedCheckBoxItems: any[] = statusFilterFormGroup?.get('selectedCheckboxItems')?.value;
    if (selectedCheckBoxItems?.length > 0 && this.isFilterEnabled()) {
      statusFilterFormGroup.get('filteredItems').patchValue(
        itemsToBeFiltered.filter(itemToBeFiltered => {
          return statusesWithAssetId.filter(statusWithAssetId => statusWithAssetId.status.value === null ?
            selectedCheckBoxItems.includes(this.checkBoxItems[0]) : selectedCheckBoxItems
              .includes(this.checkBoxItems[statusWithAssetId.status.value]))
            .map(statusWithAssetId => statusWithAssetId.factoryAssetId).includes(itemToBeFiltered.id);
        })
      );
    } else {
      statusFilterFormGroup?.get('filteredItems').patchValue(itemsToBeFiltered);
    }
  }

  ngOnInit(): void {
    if (this.statusFilterFormGroup.get('selectedCheckboxItems') !== null) {
      this.selectedCheckBoxItems = this.statusFilterFormGroup.get('selectedCheckboxItems').value;
    }
    this.getStatusValues();
  }

  private getStatusValues() {
    StatusFilterComponent.checkBoxItems.forEach((item, index) => {
      this.checkBoxItemsSet.add({ value: item, id: index });
    });
  }

  filterItemsBySelectedValues() {
    this.statusFilterFormGroup.get('selectedCheckboxItems').patchValue(this.selectedCheckBoxItems);
    StatusFilterComponent.enableFilter();
    StatusFilterComponent.applyFilter(this.statusFilterFormGroup, this.itemsToBeFiltered, this.statusesWithAssetId);
    this.itemsFiltered.emit();
  }

  clearSelectedValues() {
    StatusFilterComponent.disableFilter();
    this.statusFilterFormGroup.get('filteredItems').patchValue(this.itemsToBeFiltered);
    this.statusFilterFormGroup.get('selectedCheckboxItems').patchValue(null);
    this.selectedCheckBoxItems = [];
    this.itemsFiltered.emit();
  }
}

