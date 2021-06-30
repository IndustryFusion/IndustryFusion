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
import { AssetSeriesDetails } from '../../../../store/asset-series-details/asset-series-details.model';
import { ID } from '@datorama/akita';
import { ItemOptionsMenuType } from '../../../../components/ui/item-options-menu/item-options-menu.type';

@Component({
  selector: 'app-asset-series-list-item',
  templateUrl: './asset-series-list-item.component.html',
  styleUrls: ['./asset-series-list-item.component.scss']
})
export class AssetSeriesListItemComponent implements OnInit {

  @Input()
  item: AssetSeriesDetails;

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

  shouldShowDeleteItem = false;

  ItemOptionsMenuType = ItemOptionsMenuType;

  constructor() {
  }

  ngOnInit(): void {
  }

  createItem() {
    this.createAsset.emit(this.item.id);
  }

  editItem() {
    this.itemEdit.emit(this.item.id);
  }

  showDeleteItem() {
    this.shouldShowDeleteItem = true;
  }

  deleteItem() {
    this.shouldShowDeleteItem = false;
    this.itemDelete.emit(this.item.id);
  }

  select() {
    !this.selected ? this.itemSelected.emit(this.item.id) : this.itemDeselected.emit(this.item.id);
  }
}
