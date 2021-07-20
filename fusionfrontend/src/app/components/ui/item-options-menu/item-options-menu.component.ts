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
import { MenuItem } from 'primeng/api';
import { ItemOptionsMenuType } from './item-options-menu.type';

@Component({
  selector: 'app-item-options-menu',
  templateUrl: './item-options-menu.component.html',
  styleUrls: ['./item-options-menu.component.scss']
})
export class ItemOptionsMenuComponent implements OnInit {

  @Input() type: ItemOptionsMenuType[];
  @Input() createItemName: string;
  @Output() createItem = new EventEmitter<void>();
  @Output() cloneItem = new EventEmitter<void>();
  @Output() renameItem = new EventEmitter<void>();
  @Output() editItem = new EventEmitter<void>();
  @Output() deleteItem = new EventEmitter<void>();
  public menuActions: MenuItem[];

  public ItemOptionsMenuType = ItemOptionsMenuType;
  @Input() appendTo: any = null;

  constructor() {
  }

  ngOnInit(): void {
   this.initMenuItems();
  }

  private initMenuItems() {

    const editItem   = { label: 'Edit', icon: 'pi pi-fw pi-pencil', command: (_) => { this.onEditClick(); } };
    const cloneItem  = { label: 'Clone', icon: 'pi pi-fw pi-clone', command: (_) => { this.onCloneClick(); } };
    const renameItem = { label: 'Rename', icon: 'pi pi-fw pi-sign-in', command: (_) => { this.onRenameClick(); } };
    const deleteItem = { label: 'Delete', icon: 'pi pw-fw pi-trash', command: (_) => { this.onDeleteClick(); } };
    const updateItem = { label: 'Update', icon: 'pi pi-fw pi-refresh', command: (_) => { this.onEditClick(); } };
    const createItem = {
      label: this.createItemName ? `Create new ${this.createItemName}` : 'Create', icon: 'pi pi-fw pi-plus',
      command: (_) => { this.onCreateClick(); }
    };

    this.menuActions = [];

    if (!this.type) {
      this.menuActions = [editItem, deleteItem ];
    } else {
      for (const itemOptionsMenuType of this.type) {
        switch (itemOptionsMenuType) {
          case ItemOptionsMenuType.EDIT:
            this.menuActions.push(editItem);
            break;
          case ItemOptionsMenuType.DELETE:
            this.menuActions.push(deleteItem);
            break;
          case ItemOptionsMenuType.UPDATE:
            this.menuActions.push(updateItem);
            break;
          case ItemOptionsMenuType.CREATE:
            this.menuActions.push(createItem);
            break;
          case ItemOptionsMenuType.CLONE:
            this.menuActions.push(cloneItem);
            break;
          case ItemOptionsMenuType.RENAME:
            this.menuActions.push(renameItem);
        }
      }
    }
  }

  onCreateClick() {
    this.createItem.emit();
  }

  onCloneClick() {
    this.cloneItem.emit();
  }

  onRenameClick() {
    this.renameItem.emit();
  }

  onEditClick() {
    this.editItem.emit();
  }

  onDeleteClick() {
    this.deleteItem.emit();
  }

}
