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

import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Quantity} from 'src/app/store/quantity/quantity.model';
import {QuantityQuery} from 'src/app/store/quantity/quantity.query';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {FormGroup} from "@angular/forms";
import {Unit} from "../../../../store/unit/unit.model";

@Component({
  selector: 'app-unit-create',
  templateUrl: './unit-create.component.html',
  styleUrls: ['./unit-create.component.scss']
})
export class UnitCreateComponent implements OnInit {

  unitForm: FormGroup;
  quantityTypes$: Observable<Quantity[]>;
  editMode: boolean = false;

  constructor(private quantityQuery: QuantityQuery, public ref: DynamicDialogRef, public config: DynamicDialogConfig) {
  }

  ngOnInit() {
    this.quantityTypes$ = this.quantityQuery.selectAll();
    this.unitForm = this.config.data?.unitForm;
    this.editMode = this.config.data?.editMode;
  }

  dismissModal() {
    this.ref.close();
  }

  confirmModal() {
    const unit = new Unit();
    unit.name = this.unitForm.get('name')?.value;
    unit.label = this.unitForm.get('label')?.value;
    unit.symbol = this.unitForm.get('symbol')?.value;
    unit.description = this.unitForm.get('conversion')?.value;
    unit.quantityTypeId = this.unitForm.get('type')?.value;

    this.ref.close(unit);
  }

}
