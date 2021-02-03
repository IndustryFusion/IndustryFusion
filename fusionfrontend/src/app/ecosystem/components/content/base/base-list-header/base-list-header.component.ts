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

import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { faSort } from '@fortawesome/free-solid-svg-icons';

@Component({
  template: '',
})
export class BaseListHeaderComponent implements OnInit {

  @Output()
  sortEvent = new EventEmitter<string>();

  sortField: string;

  faSort = faSort;

  constructor() { }

  ngOnInit() {
  }

  sort(field: string) {
    this.sortEvent.emit(field);
    this.sortField = field;
  }

}
