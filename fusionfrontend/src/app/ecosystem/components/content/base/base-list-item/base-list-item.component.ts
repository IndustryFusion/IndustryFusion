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

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ID } from '@datorama/akita';

import { RestService } from '../../../../../core/services/api/rest.service';
import { BaseEntity } from '../../../../../core/store/baseentity.model';

@Component({
  template: '',
})
export class BaseListItemComponent implements OnInit {

  shouldShowDeleteItem = false;

  @Input()
  item: BaseEntity;

  @Output()
  itemSelected = new EventEmitter<ID>();

  @Output()
  itemDeselected = new EventEmitter<ID>();

  @Input()
  selected = false;

  constructor(public route: ActivatedRoute, public router: Router, public service: RestService<BaseEntity>) { }

  ngOnInit() {
  }

  editItem() {
    this.router.navigate([this.item.id, 'edit'], { relativeTo: this.route });
  }

  showDeleteItem() {
    this.shouldShowDeleteItem = true;
  }

  deleteItem() {
    this.shouldShowDeleteItem = false;
    this.service.deleteItem(this.item.id).subscribe();
  }

  select() {
    !this.selected ? this.itemSelected.emit(this.item.id) : this.itemDeselected.emit(this.item.id);
  }

}
