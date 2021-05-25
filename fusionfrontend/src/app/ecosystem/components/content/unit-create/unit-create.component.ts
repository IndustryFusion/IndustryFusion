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

import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { QuantityType } from 'src/app/store/quantity-type/quantity-type.model';
import { Unit } from 'src/app/store/unit/unit.model';
import { QuantityTypeQuery } from 'src/app/store/quantity-type/quantity-type.query';

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

  quantityTypes$: Observable<QuantityType[]>;

  @Output() dismissModalSignal = new EventEmitter<boolean>();
  @Output() confirmModalSignal = new EventEmitter<Unit>();

  constructor(private quantityQuarey: QuantityTypeQuery) { }

  ngOnInit() {
    this.quantityTypes$ = this.quantityQuarey.selectAll();
  }

  dismissModal() { this.dismissModalSignal.emit(true); }

  confirmModal() {
    const unit = new Unit();
    unit.name = this.name;
    unit.description = this.description;
    unit.label = this.label;
    unit.symbol = this.symbol;
    unit.quantityTypeId = this.quantityTypeId;
    this.confirmModalSignal.emit(unit);
  }

}
