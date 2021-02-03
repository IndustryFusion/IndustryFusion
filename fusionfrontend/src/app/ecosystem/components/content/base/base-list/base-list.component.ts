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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryEntity, ID } from '@datorama/akita';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RestService } from '../../../../../services/rest.service';
import { BaseEntity } from '../../../../../store/baseentity.model';

@Component({
  template: '',
})
export class BaseListComponent implements OnInit {

  isLoading$: Observable<boolean>;
  sortField: string;
  items$: Observable<any[]>;
  selected: Set<ID> = new Set();
  error: any;
  shouldShowCreateItem = false;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public query: QueryEntity<any, any>,
    public service?: RestService<BaseEntity>) { }

  ngOnInit() {
    this.items$ = this.query.selectAll();
    this.query.selectError().pipe(tap((error) => {
      if (error) {
        this.error = error;
      }
    })).subscribe();
  }

  createItem() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  onSort(field: string) {
    this.sortField = field;
  }

  onItemSelect(id: ID) {
    this.selected.add(id);
  }

  onItemDeselect(id: ID) {
    this.selected.delete(id);
  }

  deleteItems() {
    this.selected.forEach(id => {
      this.service.deleteItem(id).subscribe(() => this.selected.delete(id));
    });
  }

  deselectAllItems() {
    this.selected.clear();
  }

  isSelected(id: ID) {
    return this.selected.has(id);
  }

  getErrorMessage() {
    if (this.error) {
      return this.error.error.message;
    }
    return undefined;
  }

  onCloseError() {
    this.error = undefined;
  }

  createItemModal() {
    this.shouldShowCreateItem = true;
  }

  onDismissModal() { this.shouldShowCreateItem = false; }

  onConfirmModal(item: BaseEntity) {
    this.service.createItem(item).subscribe();
    this.shouldShowCreateItem = false;
  }
}
