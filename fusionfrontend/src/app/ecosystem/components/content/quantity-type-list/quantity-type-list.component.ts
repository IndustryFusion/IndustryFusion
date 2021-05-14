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
import { QuantityQuery } from '../../../../store/quantity/quantity.query';
import { QuantityService } from '../../../../store/quantity/quantity.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { QuantityTypeCreateComponent } from '../quantity-type-create/quantity-type-create.component';
import { Quantity } from '../../../../store/quantity/quantity.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
    public quantityQuery: QuantityQuery,
    public quantityService: QuantityService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder) {
      super(route, router, quantityQuery, quantityService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.createQuantityTypeForm(this.formBuilder);
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
    this.quantityQuery.resetError();
  }

  createQuantityTypeForm(formBuilder: FormBuilder): void {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    this.quantityTypeForm = formBuilder.group({
      id: [],
      name: ['', requiredTextValidator],
      label: ['', requiredTextValidator],
      description: ['', Validators.maxLength(255)],
      baseUnitId: [0, Validators.required]
    });
  }

  showCreateDialog() {
    const ref = this.dialogService.open(QuantityTypeCreateComponent, {
      data: {
        quantityTypeForm: this.quantityTypeForm,
      },
      header: `Create new Quantity Type`,
    });

    ref.onClose.subscribe((quantityType: Quantity) => this.onCloseCreateDialog(quantityType));
  }

  private onCloseCreateDialog(quantityType: Quantity) {
    if (quantityType) {
      this.quantityService.editItem(quantityType.id, quantityType).subscribe();
      /*this.updateUI(quantityType);*/
    }
  }
}
