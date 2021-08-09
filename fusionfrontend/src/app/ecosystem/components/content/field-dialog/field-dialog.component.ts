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

import { Unit } from '../../../../store/unit/unit.model';
import { UnitQuery } from '../../../../store/unit/unit.query';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Field, FieldThresholdType } from '../../../../store/field/field.model';
import { SelectItem } from 'primeng/api';
import { DialogType } from 'src/app/common/models/dialog-type.model';
import { FieldService } from '../../../../store/field/field.service';

@Component({
  selector: 'app-field-dialog',
  templateUrl: './field-dialog.component.html',
  styleUrls: ['./field-dialog.component.scss']
})
export class FieldDialogComponent implements OnInit, OnDestroy {

  public type: DialogType;
  public fieldForm: FormGroup;
  public units$: Observable<Unit[]>;
  public accuracyItems: SelectItem[];

  public DialogType = DialogType;
  public FieldThresholdType = FieldThresholdType;

  constructor(private unitQuery: UnitQuery,
              private formBuilder: FormBuilder,
              private fieldService: FieldService,
              public dialogRef: DynamicDialogRef,
              public config: DynamicDialogConfig) { }

  ngOnInit() {
    this.type = this.config.data.field === undefined ? DialogType.CREATE : DialogType.EDIT;
    this.createFieldFormGroup(this.config.data.field);

    this.units$ = this.unitQuery.selectAll();

    this.accuracyItems = [
      { label: '0', value: 0 },
      { label: '0.0', value: 1 },
      { label: '0.00', value: 2 },
      { label: '0.000', value: 3 },
      { label: '0.0000', value: 4 },
    ];
  }

  private createFieldFormGroup(field: Field) {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];

    this.fieldForm = this.formBuilder.group({
      id: [],
      name: ['', requiredTextValidator],
      label: ['', requiredTextValidator],
      description: ['', Validators.maxLength(255)],
      accuracy: [0],
      unitId: [1, Validators.required],
      thresholdType: [FieldThresholdType.OPTIONAL, Validators.required]
    });

    if (this.type === DialogType.EDIT && field) {
      this.fieldForm.patchValue(field);
    }
  }

  onSubmit() {
    if (this.fieldForm.valid) {
      const field: Field = this.fieldForm.getRawValue() as Field;
      if (field) {
        if (this.type === DialogType.EDIT) {
          this.fieldService.editItem(field.id, field).subscribe();
        } else {
          this.fieldService.createItem(field).subscribe();
        }

        this.fieldService.setActive(field.id);
        this.dialogRef.close(field);
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.dialogRef.close();
  }
}
