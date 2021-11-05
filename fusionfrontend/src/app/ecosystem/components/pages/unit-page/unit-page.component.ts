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

import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Unit } from '../../../../core/store/unit/unit.model';
import { ActivatedRoute } from '@angular/router';
import { UnitService } from '../../../../core/store/unit/unit.service';
import { UnitQuery } from '../../../../core/store/unit/unit.query';
import { QuantityTypeService } from '../../../../core/store/quantity-type/quantity-type.service';
import { DialogService } from 'primeng/dynamicdialog';
import { first } from 'rxjs/operators';
import { UnitDialogComponent } from '../../content/unit-dialog/unit-dialog.component';
import { DialogType } from '../../../../shared/models/dialog-type.model';

@Component({
  selector: 'app-unit-page',
  templateUrl: './unit-page.component.html',
  styleUrls: ['./unit-page.component.scss'],
  providers: [DialogService],
})
export class UnitPageComponent implements OnInit {

  unit$: Observable<Unit>;

  constructor(private activatedRoute: ActivatedRoute,
              private unitService: UnitService,
              private unitQuery: UnitQuery,
              private dialogService: DialogService,
              private quantityTypeService: QuantityTypeService) {
  }

  ngOnInit(): void {
    this.resolve();
  }

  resolve(): void {
    const unitId = this.activatedRoute.snapshot.paramMap.get('unitId');
    if (unitId != null) {
      this.unitService.setActive(unitId);
      this.unit$ = this.unitQuery.selectActive();
    }
  }

  showDialog() {
    this.unit$.pipe(first()).subscribe((unit) => {
      const dialogRef = this.dialogService.open(UnitDialogComponent, {
        header: 'Edit Unit', width: '50%',
        data: { unit, type: DialogType.EDIT }
      });

      dialogRef.onClose.subscribe((modifiedUnit) => {
        this.updateUnitIfPresent(unit, modifiedUnit);
      });
    });
  }

  updateUnitIfPresent(unit: Unit, modifiedUnit: Unit): void {
    if (unit && modifiedUnit) {
      const patchedUnit = { ...unit, ...modifiedUnit };
      this.quantityTypeService.getItem(patchedUnit.quantityTypeId).toPromise().then((quantityType) => {
        patchedUnit.quantityType = quantityType;
        this.unitService.editUnit(unit.quantityType?.id, unit.id, patchedUnit).subscribe();
      });
    }
  }
}
