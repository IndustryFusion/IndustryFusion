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

import { Observable } from 'rxjs';

import { Unit } from '../../../../store/unit/unit.model';
import { UnitQuery } from '../../../../store/unit/unit.query';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormGroup } from '@angular/forms';
import { Field } from '../../../../store/field/field.model';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-field-dialog',
  templateUrl: './field-dialog.component.html',
  styleUrls: ['./field-dialog.component.scss']
})
export class FieldDialogComponent implements OnInit {

  public isEditing = true;
  public fieldForm: FormGroup;
  public units$: Observable<Unit[]>;
  public accuracyItems: SelectItem[];

  constructor(private unitQuery: UnitQuery,
              public ref: DynamicDialogRef,
              public config: DynamicDialogConfig) { }

  ngOnInit() {
    this.fieldForm = this.config.data.fieldForm;
    this.isEditing = this.config.data.isEditing;
    this.units$ = this.unitQuery.selectAll();

    this.accuracyItems = [
      { label: '0', value: 0 },
      { label: '0.0', value: 1 },
      { label: '0.00', value: 2 },
      { label: '0.000', value: 3 },
      { label: '0.0000', value: 4 },
    ];
  }

  onCancel() {
    this.ref.close();
  }

  onSubmit() {
    if (this.fieldForm.valid) {
      const field = new Field();
      if (this.isEditing) {
        field.id  = this.fieldForm.get('id')?.value;
      }
      field.name  = this.fieldForm.get('name')?.value;
      field.label = this.fieldForm.get('label')?.value;
      field.description = this.fieldForm.get('description')?.value;
      field.unitId = this.fieldForm.get('unitId')?.value;
      field.accuracy = this.fieldForm.get('accuracy')?.value;
      this.ref.close(field);
    }
  }
}
