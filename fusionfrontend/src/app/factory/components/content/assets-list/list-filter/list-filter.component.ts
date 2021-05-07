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
import { AssetDetailsWithFields } from '../../../../../store/asset-details/asset-details.model';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import * as _ from 'lodash';
import { FilterOptions } from '../assets-list.component';

@Component({
  selector: 'app-list-filter',
  templateUrl: './list-filter.component.html',
  styleUrls: ['./list-filter.component.scss']
})
export class ListFilterComponent implements OnInit, OnChanges {

  faFilter = faFilter;
  dropdownOpen = false;
  form: FormGroup;

  @Input()
  attribute: string;

  @Input()
  attributeName: string;

  @Input()
  assets: AssetDetailsWithFields[];

  @Output()
  filterEvent = new EventEmitter<FilterOptions>();

  constructor(private formBuilder: FormBuilder) {
  }

  get assetsFormArray() {
    return this.form.controls.assets as FormArray;
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.assets) {
      if (this.assets) {
        this.assets = this.assets.filter((test, index, array) =>
          index === array.findIndex((findTest) => findTest[this.attribute] === test[this.attribute]
          )
        );
        this.form = this.formBuilder.group({
          assets: this.buildAssetForms()
        });
      }
    }
  }

  buildAssetForms(): FormArray {
    if (this.assets) {
      const formControls = this.assets.map(() => {
      return this.formBuilder.control( false);
    });
      return this.formBuilder.array(formControls);
    }
  }

  changed() {
    const selectedFields = this.form.value.assets.map(
      (checked, i) => checked ? this.assets[i][this.attribute] : null).filter(
        v => v !== null);
    const filterOptions: FilterOptions = Object.assign({ }, { filterAttribute: this.attribute, filterFields: selectedFields});
    this.filterEvent.emit(filterOptions);
    this.dropdownOpen = false;
  }

}
