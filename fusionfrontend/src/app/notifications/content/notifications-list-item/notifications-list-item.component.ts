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
import { ID } from '@datorama/akita';
import { OispNotification, OispPriority } from '../../../services/notification.model';

@Component({
  selector: 'app-notifications-list-item',
  templateUrl: './notifications-list-item.component.html',
  styleUrls: ['./notifications-list-item.component.scss']
})
export class NotificationsListItemComponent implements OnInit {

  @Input()
  item: OispNotification;

  @Output()
  itemSelected = new EventEmitter<ID>();

  @Output()
  itemDeselected = new EventEmitter<ID>();

  @Output()
  createAsset = new EventEmitter<ID>();

  @Output()
  itemEdit = new EventEmitter<ID>();

  @Output()
  itemDelete = new EventEmitter<ID>();

  @Input()
  selected = false;

  OispPriority = OispPriority;

  constructor() {
  }

  ngOnInit(): void {
  }

  deleteItem() {
    this.itemDelete.emit(this.item.id);
  }

  select() {
    !this.selected ? this.itemSelected.emit(this.item.id) : this.itemDeselected.emit(this.item.id);
  }
}
