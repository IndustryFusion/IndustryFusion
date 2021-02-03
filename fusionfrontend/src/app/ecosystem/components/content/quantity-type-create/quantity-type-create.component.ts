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

import { Quantity } from '../../../../store/quantity/quantity.model';
import { Unit } from 'src/app/store/unit/unit.model';
import { Observable } from 'rxjs';
import { UnitQuery } from 'src/app/store/unit/unit.query';

@Component({
  selector: 'app-quantity-type-create',
  templateUrl: './quantity-type-create.component.html',
  styleUrls: ['./quantity-type-create.component.scss']
})
export class QuantityTypeCreateComponent implements OnInit {

  name: string;
  description: string;
  label: string;
  baseUnitId: ID;

  units$: Observable<Unit[]>;

  @Output() dismissModalSignal = new EventEmitter<boolean>();
  @Output() confirmModalSignal = new EventEmitter<Quantity>();

  constructor(private unitQuarey: UnitQuery) { }

  ngOnInit() {
    this.units$ = this.unitQuarey.selectAll();
  }

  dismissModal() { this.dismissModalSignal.emit(true); }

  confirmModal() {
    const quantityType = new Quantity();
    quantityType.name = this.name;
    quantityType.description = this.description;
    quantityType.label = this.label;
    quantityType.baseUnitId = this.baseUnitId;
    this.confirmModalSignal.emit(quantityType);
  }

}
