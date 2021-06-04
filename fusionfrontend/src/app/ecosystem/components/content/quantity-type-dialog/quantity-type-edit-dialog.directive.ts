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

import { Directive, HostListener, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuantityDataType } from '../../../../store/field/field.model';
import { QuantityTypeDialogContentComponent } from './quantity-type-dialog-content/quantity-type-dialog-content.component';
import { QuantityType } from '../../../../store/quantity-type/quantity-type.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { QuantityTypeService } from '../../../../store/quantity-type/quantity-type.service';

@Directive({
  selector: '[appQuantityTypeEditDialog]',
  providers: [DialogService]
})
export class QuantityTypeEditDialogDirective implements OnDestroy {

  @Input() item: QuantityType;

  public ref: DynamicDialogRef;
  public quantityTypeForm: FormGroup;

  constructor(public dialogService: DialogService,
              private formBuilder: FormBuilder,
              public quantityService: QuantityTypeService) { }

  @HostListener('editItem') onClicked() {
    this.showEditDialog();
  }

  public showEditDialog() {
    this.createQuantityTypeForm(this.formBuilder);
    this.quantityService.setActive(this.item.id);

    const ref = this.dialogService.open(QuantityTypeDialogContentComponent, {
      data: {
        quantityTypeForm: this.quantityTypeForm,
        isEditing: true
      },
      header: `Edit Quantity Type`,
    });

    ref.onClose.subscribe((quantityType: QuantityType) => this.onCloseEditDialog(quantityType));
  }

  private createQuantityTypeForm(formBuilder: FormBuilder): void {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    this.quantityTypeForm = formBuilder.group({
      id: [],
      name: ['', requiredTextValidator],
      label: ['', requiredTextValidator],
      description: ['', requiredTextValidator],
      baseUnitId: [null, Validators.required],
      dataType: [QuantityDataType.CATEGORICAL, Validators.required]
    });
    this.quantityTypeForm.patchValue(this.item);
    this.quantityTypeForm.get('baseUnitId').setValue(this.item.baseUnit?.id);
  }

  private onCloseEditDialog(quantityType: QuantityType) {
    if (quantityType) {
      this.quantityService.editItem(quantityType.id, quantityType).subscribe(
        () => this.quantityService.editBaseUnit(quantityType.id, quantityType.baseUnitId).subscribe());
    }
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
