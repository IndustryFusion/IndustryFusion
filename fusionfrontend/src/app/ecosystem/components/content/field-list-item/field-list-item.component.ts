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

import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseListItemComponent } from '../base/base-list-item/base-list-item.component';
import { FieldService } from '../../../../store/field/field.service';
import { Field } from '../../../../store/field/field.model';
import { FieldDialogComponent } from '../field-dialog/field-dialog.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-field-list-item',
  templateUrl: './field-list-item.component.html',
  styleUrls: ['./field-list-item.component.scss']
})
export class FieldListItemComponent extends BaseListItemComponent implements OnInit, OnDestroy {

  @Input()
  item: Field;

  private editDialogRef: DynamicDialogRef;

  constructor(public route: ActivatedRoute,
              public router: Router,
              public fieldService: FieldService,
              private dialogService: DialogService) {
    super(route, router, fieldService);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.editDialogRef?.close();
  }

  showEditDialog() {
    this.editDialogRef = this.dialogService.open(FieldDialogComponent, {
      data: { field: this.item },
      header: 'Edit Metric or Attribute'
    });
  }
}
