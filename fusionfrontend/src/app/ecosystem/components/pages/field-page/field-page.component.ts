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
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FieldQuery } from '../../../../core/store/field/field.query';
import { FieldService } from '../../../../core/store/field/field.service';
import { Field, FieldDataType } from '../../../../core/store/field/field.model';
import { FieldDialogComponent } from '../../content/field-dialog/field-dialog.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Unit } from '../../../../core/store/unit/unit.model';
import { UnitQuery } from '../../../../core/store/unit/unit.query';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-field-page',
  templateUrl: './field-page.component.html',
  styleUrls: ['./field-page.component.scss']
})
export class FieldPageComponent implements OnInit, OnDestroy {

  isLoading$: Observable<boolean>;
  field$: Observable<Field>;
  unit$: Observable<Unit>;
  public dataTypes = FieldDataType;
  private field: Field;
  private editDialogRef: DynamicDialogRef;

  constructor(private fieldQuery: FieldQuery,
              private unitQuery: UnitQuery,
              private fieldService: FieldService,
              private activatedRoute: ActivatedRoute,
              private dialogService: DialogService,
              private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.isLoading$ = this.fieldQuery.selectLoading();
    this.resolve(this.activatedRoute);
  }

  ngOnDestroy(): void {
    this.fieldQuery.resetError();
    this.editDialogRef?.close();
  }

  showEditDialog() {
    this.editDialogRef = this.dialogService.open(FieldDialogComponent, {
      data: { field: this.field },
      header: this.translate.instant('APP.ECOSYSTEM.PAGES.FIELD.EDIT_METRIC_OR_ATTRIBUTE')
    });
  }

  private resolve(activatedRoute: ActivatedRoute) {
    const fieldId = activatedRoute.snapshot.paramMap.get('fieldId');
    if (fieldId != null) {
      this.fieldService.setActive(fieldId);
      this.field$ = this.fieldQuery.selectActive();
      this.field$.subscribe(field => {
        if (field?.unitId) {
          this.unit$ = this.unitQuery.selectEntity(field.unitId);
        }
        this.field = field;
      });
    }
  }
}
