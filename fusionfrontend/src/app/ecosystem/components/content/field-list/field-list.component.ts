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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FieldDialogComponent } from '../field-dialog/field-dialog.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { Field } from '../../../../store/field/field.model';
import { ConfirmationService } from 'primeng/api';
import { FieldComposedQuery } from '../../../../store/composed/field-composed.query';

@Component({
  selector: 'app-field-list',
  templateUrl: './field-list.component.html',
  styleUrls: ['./field-list.component.scss'],
})
export class FieldListComponent implements OnInit, OnDestroy {

  public titleMapping:
    { [k: string]: string } = {
    '=0': 'No Metrics & Attributes',
    '=1': '# Metric & Attribute',
    other: '# Metrics & Attributes'
  };
  fields$: Observable<Field[]>;
  fields: Field[];
  displayedFields: Field[];
  fieldsSearchedByName: Field[];
  activeListItem: Field;
  private dialogRef: DynamicDialogRef;

  constructor(
    private fieldComposedQuery: FieldComposedQuery,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService) {
  }

  ngOnInit() {
    this.fields$ = this.fieldComposedQuery.selectAll();
    this.fields$.subscribe(fields => {
      this.displayedFields = this.fields = this.fieldsSearchedByName = fields;
    });
  }

  ngOnDestroy() {
    this.dialogRef?.close();
  }

  setActiveRow(field?: Field) {
    if (field) {
      this.activeListItem = field;
    }
  }

  searchFieldByName(event: Field[]): void {
    this.fieldsSearchedByName = event;
    this.updateDisplayedFields();
  }

  showCreateDialog() {
    this.dialogRef = this.dialogService.open(FieldDialogComponent, {
      data: { },
      header: 'Create new Metric or Attribute',
    });
  }

  showEditDialog() {
    this.dialogRef = this.dialogService.open(FieldDialogComponent, {
      data: { field: this.activeListItem },
      header: 'Edit Metric or Attribute'
    });
  }

  showDeleteDialog() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the Metric or Attribute ' + this.activeListItem.name + '?',
      header: 'Delete Metric or Attribute Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteField();
      },
      reject: () => {
      }
    });
  }

  deleteField() {
  }

  private updateDisplayedFields(): void {
    this.displayedFields = this.fieldsSearchedByName;
  }

}
