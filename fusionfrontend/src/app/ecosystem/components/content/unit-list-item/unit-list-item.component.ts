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

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseListItemComponent } from '../base/base-list-item/base-list-item.component';
import { UnitService } from '../../../../store/unit/unit.service';
import { Unit } from '../../../../store/unit/unit.model';
import { UnitDialogComponent } from '../unit-dialog/unit-dialog.component';
import { FormBuilder } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { QuantityTypeService } from '../../../../store/quantity-type/quantity-type.service';

@Component({
  selector: 'app-unit-list-item',
  templateUrl: './unit-list-item.component.html',
  styleUrls: ['./unit-list-item.component.scss']
})
export class UnitListItemComponent extends BaseListItemComponent implements OnInit {

  @Input()
  item: Unit;

  constructor(public route: ActivatedRoute, public router: Router, public unitService: UnitService,
              public quantityTypeService: QuantityTypeService, public dialogService: DialogService,
              public formBuilder: FormBuilder) {
    super(route, router, unitService);
  }

  ngOnInit() {
  }

  deleteItem() {
    this.unitService.deleteUnit(this.item.quantityTypeId, this.item.id).subscribe();
  }

  editItem(): void {
    const dialogRef = this.dialogService.open(UnitDialogComponent, {
      header: 'Edit Unit', width: '50%', data: { unit: this.item, editMode: true }
    });
    dialogRef.onClose.subscribe((unit) => {
      this.updateUnitIfPresent(unit);
    });
  }

  updateUnitIfPresent(unit: Unit): void {
    if (unit) {
      const patchedUnit = { ...this.item, ...unit };
      this.quantityTypeService.getItem(patchedUnit.quantityTypeId).toPromise().then((quantityType) => {
        patchedUnit.quantityType = quantityType;
        this.unitService.editUnit(this.item.quantityType.id, this.item.id, patchedUnit).subscribe();
      });
    }
  }

}
