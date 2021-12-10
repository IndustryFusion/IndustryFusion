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
import { MenuItem } from 'primeng/api';
import { ItemOptionsMenuType } from './item-options-menu.type';

@Component({
  selector: 'app-item-options-menu',
  templateUrl: './item-options-menu.component.html',
  styleUrls: ['./item-options-menu.component.scss']
})
export class ItemOptionsMenuComponent implements OnInit, OnChanges {

  @Input() appendTo: any = null;

  @Input() actions: ItemOptionsMenuType[];
  @Input() createItemName: string;
  @Input() assignItemText: string;
  @Input() updateItemText: string;
  @Input() download1ItemText: string;
  @Input() download2ItemText: string;
  @Input() showInline = true;
  @Input() disabled = false;
  @Output() createItem = new EventEmitter<void>();
  @Output() cloneItem = new EventEmitter<void>();
  @Output() renameItem = new EventEmitter<void>();
  @Output() editItem = new EventEmitter<void>();
  @Output() deleteItem = new EventEmitter<void>();
  @Output() assignItem = new EventEmitter<void>();
  @Output() downloadItem1 = new EventEmitter<void>();
  @Output() downloadItem2 = new EventEmitter<void>();

  public menuActions: MenuItem[];
  public ItemOptionsMenuType = ItemOptionsMenuType;

  constructor() {
  }

  ngOnInit(): void {
    this.menuActions = this.generateMenuItems();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.actions) {
      this.menuActions = this.generateMenuItems();
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

  onAssignClick() {
    this.assignItem.emit();
  }

  onDownload1Click() {
    this.downloadItem1.emit();
  }

  onDownload2Click() {
    this.downloadItem2.emit();
  }

  private generateMenuItems(): MenuItem[] {
    const editItem = {
      label: 'Edit', icon: 'pi pi-fw pi-pencil', command: (_) => {
        this.onEditClick();
      }
    };
    const cloneItem = {
      label: 'Clone', icon: 'pi pi-fw pi-clone', command: (_) => {
        this.onCloneClick();
      }
    };
    const renameItem = {
      label: 'Rename', icon: 'pi pi-fw pi-sign-in', command: (_) => {
        this.onRenameClick();
      }
    };
    const deleteItem = {
      label: 'Delete', icon: 'pi pw-fw pi-trash', command: (_) => {
        this.onDeleteClick();
      }
    };
    const updateItem = {
      label: this.updateItemText ? `Update ${this.createItemName}` : 'Update',
      icon: 'pi pi-fw pi-refresh',
      command: (_) => {
        this.onEditClick();
      }
    };
    const createItem = {
      label: this.createItemName ? `Create new ${this.createItemName}` : 'Create', icon: 'pi pi-fw pi-plus',
      command: (_) => {
        this.onCreateClick();
      }
    };
    const assignItem = {
      label: this.assignItemText ? 'Assign ' + this.assignItemText : 'Assign', icon: 'pi pi-fw pi-sign-in',
      command: (_) => {
        this.onAssignClick();
      }
    };

    const downloadItem1 = {
      label: this.download1ItemText ? 'Download ' + this.download1ItemText : 'Download', icon: 'pi pi-fw pi-cloud-download',
      command: (_) => {
        this.onDownload1Click();
      }
    };

    const downloadItem2 = {
      label: this.download2ItemText ? 'Download ' + this.download2ItemText : 'Download', icon: 'pi pi-fw pi-cloud-download',
      command: (_) => {
        this.onDownload2Click();
      }
    };

    let menuActions = [];

    if (!this.actions || this.actions.length === 0) {
      menuActions = [editItem, deleteItem];
    } else {
      for (const itemOptionsMenuType of this.actions) {
        switch (itemOptionsMenuType) {
          case ItemOptionsMenuType.EDIT:
            menuActions.push(editItem);
            break;
          case ItemOptionsMenuType.DELETE:
            menuActions.push(deleteItem);
            break;
          case ItemOptionsMenuType.UPDATE:
            menuActions.push(updateItem);
            break;
          case ItemOptionsMenuType.CREATE:
            menuActions.push(createItem);
            break;
          case ItemOptionsMenuType.CLONE:
            menuActions.push(cloneItem);
            break;
          case ItemOptionsMenuType.RENAME:
            menuActions.push(renameItem);
            break;
          case ItemOptionsMenuType.ASSIGN:
            menuActions.push(assignItem);
            break;
          case ItemOptionsMenuType.DOWNLOAD1:
            menuActions.push(downloadItem1);
            break;
          case ItemOptionsMenuType.DOWNLOAD2:
            menuActions.push(downloadItem2);
            break;
        }
      }
    }
    return menuActions;
  }

}
