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
import { ActivatedRoute, Router } from '@angular/router';

import { BaseListComponent } from '../base/base-list/base-list.component';
import { QuantityTypeQuery } from '../../../../store/quantity-type/quantity-type.query';
import { QuantityTypeService } from '../../../../store/quantity-type/quantity-type.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { QuantityTypeDialogComponent } from '../quantity-type-dialog/quantity-type-dialog.component';
import { QuantityType } from '../../../../store/quantity-type/quantity-type.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuantityDataType } from '../../../../store/field/field.model';

@Component({
  selector: 'app-quantity-type-list',
  templateUrl: './quantity-type-list.component.html',
  styleUrls: ['./quantity-type-list.component.scss'],
  providers: [DialogService]
})
export class QuantityTypeListComponent extends BaseListComponent implements OnInit, OnDestroy {

  public titleMapping:
    { [k: string]: string } = { '=0': 'No Quantity Types', '=1': '# Quantity Type', other: '# Quantity Types' };

  public editBarMapping:
    { [k: string]: string } = {
      '=0': 'No quantity types selected',
      '=1': '# quantity type selected',
      other: '# quantity types selected'
    };

  public ref: DynamicDialogRef;
  public quantityTypeForm: FormGroup;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public quantityQuery: QuantityTypeQuery,
    public quantityService: QuantityTypeService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder) {
      super(route, router, quantityQuery, quantityService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
    this.quantityQuery.resetError();
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
  }

  showCreateDialog() {
    this.createQuantityTypeForm(this.formBuilder);

    const ref = this.dialogService.open(QuantityTypeDialogComponent, {
      data: {
        quantityTypeForm: this.quantityTypeForm,
        isEditing: false
      },
      header: `Create new Quantity Type`,
    });

    ref.onClose.subscribe((quantityType: QuantityType) => this.onCreateQuantityType(quantityType));
  }

  private onCreateQuantityType(quantityType: QuantityType) {
    if (quantityType) {
      this.quantityService.createItem(quantityType).subscribe();
    }
  }
}
