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

import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { QuantityType } from '../../../../store/quantity-type/quantity-type.model';
import { Unit } from 'src/app/store/unit/unit.model';
import { Observable } from 'rxjs';
import { UnitQuery } from 'src/app/store/unit/unit.query';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-quantity-type-create',
  templateUrl: './quantity-type-create.component.html',
  styleUrls: ['./quantity-type-create.component.scss']
})
export class QuantityTypeCreateComponent implements OnInit {

  public quantityTypeForm: FormGroup;
  public units$: Observable<Unit[]>;

  @Output() dismissModalSignal = new EventEmitter<boolean>();
  @Output() confirmModalSignal = new EventEmitter<QuantityType>();

  constructor(private unitQuery: UnitQuery,
              public ref: DynamicDialogRef,
              public config: DynamicDialogConfig) { }

  ngOnInit() {
    this.quantityTypeForm = this.config.data.quantityTypeForm;
    this.units$ = this.unitQuery.selectAll();
  }

  onCancel() {
    this.ref.close();
  }

  onSave() {
    if (this.quantityTypeForm.valid) {
      const quantityType = new QuantityType();
      quantityType.name  = this.quantityTypeForm.get('name')?.value;
      quantityType.label = this.quantityTypeForm.get('label')?.value;
      quantityType.description = this.quantityTypeForm.get('description')?.value;
      quantityType.baseUnitId = this.quantityTypeForm.get('baseUnitId')?.value;
      this.ref.close(quantityType);
    } else {
      this.ref.close();
    }
  }
}
