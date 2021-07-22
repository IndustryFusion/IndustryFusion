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
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Unit } from 'src/app/store/unit/unit.model';
import { Observable } from 'rxjs';
import { QuantityType } from '../../../../store/quantity-type/quantity-type.model';
import { QuantityTypeQuery } from '../../../../store/quantity-type/quantity-type.query';
import { DialogType } from '../../../../common/models/dialog-type.model';

@Component({
  selector: 'app-unit-dialog',
  templateUrl: './unit-dialog.component.html',
  styleUrls: ['./unit-dialog.component.scss']
})
export class UnitDialogComponent implements OnInit {

  unit: Unit;
  unitForm: FormGroup;
  quantityTypes$: Observable<QuantityType[]>;
  type: DialogType;

  public DialogType = DialogType;
  public isQuantityTypeLocked: boolean;

  constructor(private quantityQuery: QuantityTypeQuery,
              public dialogRef: DynamicDialogRef,
              public config: DynamicDialogConfig,
              private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.quantityTypes$ = this.quantityQuery.selectAll();
    this.unit = this.config.data?.unit;
    this.type = this.config.data?.type;
    this.isQuantityTypeLocked = this.config.data.prefilledQuantityTypeId != null;
    this.unitForm = this.createDialogFormGroup(this.unit);
  }

  createDialogFormGroup(unit: Unit): FormGroup {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    const unitGroup = this.formBuilder.group({
      id: [unit?.id],
      name: [unit?.name, requiredTextValidator],
      label: [unit?.label, Validators.maxLength(255)],
      symbol: [unit?.symbol, Validators.maxLength(255)],
      quantityTypeId: [unit?.quantityType?.id, Validators.required],
    });

    if (this.isQuantityTypeLocked) {
      unitGroup.get('quantityTypeId').patchValue(this.config.data.prefilledQuantityTypeId);
    }
    return unitGroup;
  }

  dismissModal(): void {
    this.dialogRef.close();
  }

  confirmModal(): void {
    const unit = new Unit();
    unit.name = this.unitForm.get('name')?.value;
    unit.label = this.unitForm.get('label')?.value;
    unit.symbol = this.unitForm.get('symbol')?.value;
    unit.quantityTypeId = this.unitForm.get('quantityTypeId')?.value;

    this.dialogRef.close(unit);
  }

}
