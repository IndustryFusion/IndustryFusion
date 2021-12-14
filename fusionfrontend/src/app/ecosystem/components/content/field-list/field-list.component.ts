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
import { Field } from '../../../../core/store/field/field.model';
import { ConfirmationService } from 'primeng/api';
import { FieldComposedQuery } from '../../../../core/store/composed/field-composed.query';
import { TableHelper } from '../../../../core/helpers/table-helper';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-field-list',
  templateUrl: './field-list.component.html',
  styleUrls: ['./field-list.component.scss'],
})
export class FieldListComponent implements OnInit, OnDestroy {

  titleMapping:
  { [k: string]: string} = { '=0': this.translate.instant('APP.ECOSYSTEM.FIELD_LIST.NO_METRICS_AND_ATTRIBUTES'),
    '=1': '# ' + this.translate.instant('APP.ECOSYSTEM.FIELD_LIST.METRIC_AND_ATTRIBUTE'),
    other: '# ' + this.translate.instant('APP.ECOSYSTEM.FIELD_LIST.METRICS_AND_ATTRIBUTES') };

  rowsPerPageOptions: number[] = TableHelper.rowsPerPageOptions;
  rowCount = TableHelper.defaultRowCount;

  fields$: Observable<Field[]>;
  fields: Field[];
  displayedFields: Field[];
  fieldsSearchedByName: Field[];

  activeListItem: Field;

  private dialogRef: DynamicDialogRef;


  constructor(
    private fieldComposedQuery: FieldComposedQuery,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService) {
  }

  ngOnInit() {
    this.fields$ = this.fieldComposedQuery.selectAll();
    this.fields$.subscribe(fields => {
      this.displayedFields = this.fields = this.fieldsSearchedByName = fields;
    });

    this.rowCount = TableHelper.getValidRowCountFromUrl(this.rowCount, this.activatedRoute.snapshot, this.router);
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
      header: this.translate.instant('APP.ECOSYSTEM.FIELD_LIST.HEADER.CREATE'),
    });
  }

  showEditDialog() {
    this.dialogRef = this.dialogService.open(FieldDialogComponent, {
      data: { field: this.activeListItem },
      header: this.translate.instant('APP.ECOSYSTEM.FIELD_LIST.HEADER.EDIT')
    });
  }

  showDeleteDialog() {
    this.confirmationService.confirm({
      message: this.translate.instant('APP.ECOSYSTEM.FIELD_LIST.CONFIRMATION_DIALOG.MESSAGE', { itemToDelete: this.activeListItem.name}),
      header: this.translate.instant('APP.ECOSYSTEM.FIELD_LIST.CONFIRMATION_DIALOG.HEADER'),
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

  updateRowCountInUrl(rowCount: number): void {
    TableHelper.updateRowCountInUrl(rowCount, this.router);
  }
}
