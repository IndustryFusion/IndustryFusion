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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseListItemComponent } from '../base/base-list-item/base-list-item.component';
import { QuantityTypeService } from '../../../../store/quantity-type/quantity-type.service';
import { QuantityType } from '../../../../store/quantity-type/quantity-type.model';
import { QuantityTypeDialogComponent } from '../quantity-type-dialog/quantity-type-dialog.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { QuantityDataType } from '../../../../store/field-details/field-details.model';

@Component({
  selector: 'app-quantity-type-list-item',
  templateUrl: './quantity-type-list-item.component.html',
  styleUrls: ['./quantity-type-list-item.component.scss']
})
export class QuantityTypeListItemComponent extends BaseListItemComponent implements OnInit, OnDestroy {

  @Input()
  public item: QuantityType;

  public ref: DynamicDialogRef;
  public quantityTypeForm: FormGroup;

  constructor(public route: ActivatedRoute,
              public router: Router,
              public quantityService: QuantityTypeService,
              public dialogService: DialogService,
              private formBuilder: FormBuilder) {
    super(route, router, quantityService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
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

  public showEditDialog() {
    this.createQuantityTypeForm(this.formBuilder);
    this.quantityService.setActive(this.item.id);

    const ref = this.dialogService.open(QuantityTypeDialogComponent, {
      data: {
        quantityTypeForm: this.quantityTypeForm,
        isEditing: true
      },
      header: `Edit Quantity Type`,
    });

    ref.onClose.subscribe((quantityType: QuantityType) => this.onCloseEditDialog(quantityType));
  }

  private onCloseEditDialog(quantityType: QuantityType) {
    if (quantityType) {
      this.quantityService.editItem(quantityType.id, quantityType).subscribe(
        () => this.quantityService.editBaseUnit(quantityType.id, quantityType.baseUnitId).subscribe());
    }
  }
}
