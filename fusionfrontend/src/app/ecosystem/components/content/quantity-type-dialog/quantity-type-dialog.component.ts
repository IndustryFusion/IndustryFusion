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

import { QuantityType } from '../../../../store/quantity-type/quantity-type.model';
import { Unit } from 'src/app/store/unit/unit.model';
import { Observable } from 'rxjs';
import { UnitQuery } from 'src/app/store/unit/unit.query';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormGroup } from '@angular/forms';
import { QuantityDataType } from '../../../../store/field-details/field-details.model';

@Component({
  selector: 'app-quantity-type-create',
  templateUrl: './quantity-type-dialog.component.html',
  styleUrls: ['./quantity-type-dialog.component.scss']
})

export class QuantityTypeDialogComponent implements OnInit {

  public isEditing = true;
  public existsDataType: boolean;
  public quantityTypeForm: FormGroup;
  public units$: Observable<Unit[]>;

  public valueCategorical = QuantityDataType.CATEGORICAL;
  public valueNumeric = QuantityDataType.NUMERIC;

  constructor(private unitQuery: UnitQuery,
              public ref: DynamicDialogRef,
              public config: DynamicDialogConfig) { }

  ngOnInit() {
    this.quantityTypeForm = this.config.data.quantityTypeForm;
    this.isEditing = this.config.data.isEditing;
    this.existsDataType = this.quantityTypeForm.get('dataType').value != null;
    this.units$ = this.unitQuery.selectAll();
  }

  onCancel() {
    this.ref.close();
  }

  onSubmit() {
    if (this.quantityTypeForm.valid) {
      const quantityType = new QuantityType();
      if (this.isEditing) {
        quantityType.id  = this.quantityTypeForm.get('id')?.value;
      }
      quantityType.name  = this.quantityTypeForm.get('name')?.value;
      quantityType.label = this.quantityTypeForm.get('label')?.value;
      quantityType.description = this.quantityTypeForm.get('description')?.value;
      quantityType.baseUnitId = this.quantityTypeForm.get('baseUnitId')?.value;
      quantityType.dataType = this.quantityTypeForm.get('dataType')?.value;
      this.ref.close(quantityType);
    }
  }
}
