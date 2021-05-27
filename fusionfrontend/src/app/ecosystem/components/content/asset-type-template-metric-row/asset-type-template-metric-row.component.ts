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

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ID } from '@datorama/akita';

import { UnitQuery } from '../../../../store/unit/unit.query';
import { QuantityTypeQuery } from '../../../../store/quantity-type/quantity-type.query';
import { FieldTarget } from '../../../../store/field-target/field-target.model';

@Component({
  selector: 'app-asset-type-template-metric-row',
  templateUrl: './asset-type-template-metric-row.component.html',
  styleUrls: ['./asset-type-template-metric-row.component.scss']
})
// TODO: rename to ...FieldRow...
export class AssetTypeTemplateMetricRowComponent implements OnInit {

  @Input() fieldTarget: FieldTarget;
  @Output() confirmSignal = new EventEmitter<FieldTarget>();
  @Output() editSignal = new EventEmitter<FieldTarget>();
  @Output() deleteSignal = new EventEmitter<FieldTarget>();

  @Input() confirmed: boolean;

  public accuracyDigitsInfo: string;

  constructor(private unitQuery: UnitQuery, private quantityQuery: QuantityTypeQuery) { }

  ngOnInit() {
    if (this.confirmed === undefined) {
      this.confirmed = false;
    }
    this.accuracyDigitsInfo = `1.${this.fieldTarget.field.accuracy.toString()}-${this.fieldTarget.field.accuracy.toString()}`;
  }

  onConfirm() {
    this.confirmed = true;
    if (!this.fieldTarget.name) {
      this.fieldTarget.name = this.fieldTarget.field.name;
    }
    this.confirmSignal.emit(this.fieldTarget);
  }

  onEdit() {
    this.confirmed = false;
    this.editSignal.emit(this.fieldTarget);
  }

  onDelete() {
    this.deleteSignal.emit(this.fieldTarget);
  }

  getQuantityTypeName(id: ID) {
    const unit = this.unitQuery.getEntity(id);
    const quantityType = this.quantityQuery.getEntity(unit?.quantityTypeId);
    return quantityType?.name;
  }

  getUnitSymbol(id: ID) {
    const unit = this.unitQuery.getEntity(id);
    if (unit && unit.symbol.length > 0) {
      return unit.symbol;
    }
    return '–';
  }
}
