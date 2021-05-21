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
import {ID} from '@datorama/akita';
import {Observable} from 'rxjs';
import {Quantity} from 'src/app/store/quantity/quantity.model';
import {Unit} from 'src/app/store/unit/unit.model';
import {QuantityQuery} from 'src/app/store/quantity/quantity.query';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-unit-create',
  templateUrl: './unit-create.component.html',
  styleUrls: ['./unit-create.component.scss']
})
export class UnitCreateComponent implements OnInit {

  name: string;
  description: string;
  label: string;
  symbol: string;
  quantityTypeId: ID;

  quantityTypes$: Observable<Quantity[]>;

  constructor(private quantityQuery: QuantityQuery, public ref: DynamicDialogRef, public config: DynamicDialogConfig) {
  }

  ngOnInit() {
    this.quantityTypes$ = this.quantityQuery.selectAll();
  }

  dismissModal() {
    this.ref.close();
  }

  confirmModal() {
    const unit = new Unit();
    unit.name = this.name;
    unit.description = this.description;
    unit.label = this.label;
    unit.symbol = this.symbol;
    unit.quantityTypeId = this.quantityTypeId;
    this.ref.close(unit);
  }

}
