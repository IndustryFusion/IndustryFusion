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

import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {BaseListItemComponent} from '../base/base-list-item/base-list-item.component';
import {UnitService} from '../../../../store/unit/unit.service';
import {Unit} from '../../../../store/unit/unit.model';
import {UnitCreateComponent} from "../unit-create/unit-create.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DialogService} from "primeng/dynamicdialog";
import {QuantityService} from "../../../../store/quantity/quantity.service";

@Component({
  selector: 'app-unit-list-item',
  templateUrl: './unit-list-item.component.html',
  styleUrls: ['./unit-list-item.component.scss']
})
export class UnitListItemComponent extends BaseListItemComponent implements OnInit {

  @Input()
  item: Unit;

  constructor(public route: ActivatedRoute, public router: Router, public unitService: UnitService, public quantityService: QuantityService, public dialogService: DialogService, public formBuilder: FormBuilder) {
    super(route, router, unitService);
  }

  ngOnInit() {
  }

  deleteItem() {
    this.unitService.deleteUnit(this.item.quantityTypeId, this.item.id).subscribe();
  }

  editItem(): void {
    this.showDialog();
  }

  showDialog(): void {
    const unitForm = this.createDialogFormGroup(this.item);
    const ref = this.dialogService.open(UnitCreateComponent, {
      header: "Edit Unit", width: '50%', data: {unitForm: unitForm, editMode: true}
    });
    ref.onClose.subscribe((unit) => {
      this.updateUnitIfPresent(unit);
    });
  }

  createDialogFormGroup(unit: Unit): FormGroup {
    return this.formBuilder.group({
      id: [unit.id],
      name: [unit.name, Validators.maxLength(255)],
      label: [unit.label, Validators.maxLength(255)],
      symbol: [unit.symbol, Validators.maxLength(255)],
      type: [unit.quantityTypeId, Validators.required],
      conversion: [unit.description, Validators.maxLength(255)]
    });
  }

  updateUnitIfPresent(unit: Unit): void {
    if (unit) {
      let patchedUnit = {...this.item, ...unit}
      this.quantityService.getItem(patchedUnit.quantityTypeId).toPromise().then((quantityType) => {
        patchedUnit.quantityType = quantityType;
        this.unitService.editUnit(this.item.quantityTypeId, this.item.id, patchedUnit).subscribe();
      })
    }
  }

}
