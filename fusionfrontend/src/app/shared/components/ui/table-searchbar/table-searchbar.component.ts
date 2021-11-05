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
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { BaseEntity } from '../../../../core/store/baseentity.model';

@Component({
  selector: 'app-table-searchbar',
  templateUrl: './table-searchbar.component.html',
  styleUrls: ['./table-searchbar.component.scss']
})
export class TableSearchbarComponent implements OnInit {

  @Input()
  filterColumn: string;
  @Input()
  itemsToBeFiltered: any;
  @Input()
  attributeToBeSearched: string;
  @Output()
  searchByName = new EventEmitter<any>();

  searchText: string;
  dotToSplitNestedVariables = '.';
  faSearch = faSearch;

  constructor() { }

  ngOnInit(): void {
  }

  filterItems() {
    if (this.searchText) {
      this.searchByName.emit(this.filterItemsBySearchText());
    } else {
      this.searchByName.emit(this.itemsToBeFiltered);
    }
  }

  filterItemsBySearchText<ItemType extends BaseEntity>(): ItemType {
    if (this.attributeToBeSearched.includes(this.dotToSplitNestedVariables)) {
      const attributesToBeSearched = this.attributeToBeSearched.split('.');
      return this.itemsToBeFiltered.filter(item => {
        if (item[attributesToBeSearched[0]] != null && item[attributesToBeSearched[1]] != null) {
          item[attributesToBeSearched[0]][attributesToBeSearched[1]]
            .toLowerCase().includes(this.searchText.toLowerCase());
        }
      });
    } else {
      return this.itemsToBeFiltered
        .filter(item => {
          if (item[this.attributeToBeSearched] != null) {
            return item[this.attributeToBeSearched].toLowerCase().includes(this.searchText.toLowerCase());
          }
        });
    }
  }

  clearSearchText() {
    this.searchText = '';
    this.filterItems();
  }

}
