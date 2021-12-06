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

import { QuantityType } from '../../../../core/store/quantity-type/quantity-type.model';
import { Unit } from 'src/app/core/store/unit/unit.model';
import { Observable } from 'rxjs';
import { UnitQuery } from 'src/app/core/store/unit/unit.query';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuantityDataType } from '../../../../core/store/field-details/field-details.model';
import { DialogType } from '../../../../shared/models/dialog-type.model';
import { QuantityTypeService } from '../../../../core/store/quantity-type/quantity-type.service';
import { WizardHelper } from '../../../../core/helpers/wizard-helper';

@Component({
  selector: 'app-quantity-type-dialog',
  templateUrl: './quantity-type-dialog.component.html',
  styleUrls: ['./quantity-type-dialog.component.scss']
})

export class QuantityTypeDialogComponent implements OnInit {

  public type: DialogType;
  public existsDataType: boolean;
  public quantityTypeForm: FormGroup;
  public units$: Observable<Unit[]>;

  public valueCategorical = QuantityDataType.CATEGORICAL;
  public valueNumeric = QuantityDataType.NUMERIC;
  public DialogType = DialogType;
  public MAX_TEXT_LENGTH = WizardHelper.MAX_TEXT_LENGTH;

  public noBaseUnitWarning = 'No base unit selected';
  public showBaseUnitWarning: boolean;

  constructor(private unitQuery: UnitQuery,
              private formBuilder: FormBuilder,
              public ref: DynamicDialogRef,
              public config: DynamicDialogConfig,
              public quantityTypeService: QuantityTypeService) { }

  ngOnInit() {
    this.type = this.config.data.type;
    this.units$ = this.unitQuery.selectAll();

    this.createQuantityTypeForm(this.config.data.quantityType);

    if (this.config.data.quantityType != null) {
      this.quantityTypeService.setActive(this.config.data.quantityType.id);
    }
    this.existsDataType = this.quantityTypeForm.get('dataType').value != null;
    this.showBaseUnitWarning = this.quantityTypeForm.get('baseUnitId').value === null;
  }

  onCancel() {
    this.ref.close();
  }

  private createQuantityTypeForm(quantityType: QuantityType): void {
    this.quantityTypeForm = this.formBuilder.group({
      id: [],
      version: [],
      name: ['', WizardHelper.requiredTextValidator],
      label: ['', WizardHelper.maxTextLengthValidator],
      description: ['', WizardHelper.maxTextLengthValidator],
      baseUnitId: [],
      dataType: [QuantityDataType.CATEGORICAL, Validators.required]
    });

    if (quantityType) {
      this.quantityTypeForm.patchValue(quantityType);
      this.quantityTypeForm.get('baseUnitId').setValue(quantityType.baseUnit?.id);
    }
  }

  onSubmit() {
    if (this.quantityTypeForm.valid) {
      const quantityType = this.quantityTypeForm.getRawValue() as QuantityType;

      if (this.type === DialogType.EDIT) {
        this.quantityTypeService.editItem(quantityType.id, quantityType).subscribe(
          () => this.quantityTypeService.editBaseUnit(quantityType.id, quantityType.baseUnitId).subscribe());
      } else if (this.type === DialogType.CREATE) {
        this.quantityTypeService.createItem(quantityType).subscribe();
      }

      this.ref.close(quantityType);
    }
  }

  hideBaseUnitWarning(): void {
    this.showBaseUnitWarning = false;
  }
}
