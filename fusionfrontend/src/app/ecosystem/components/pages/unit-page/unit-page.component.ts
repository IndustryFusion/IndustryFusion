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
import { Unit } from '../../../../store/unit/unit.model';
import { ActivatedRoute } from '@angular/router';
import { UnitService } from '../../../../store/unit/unit.service';
import { UnitQuery } from '../../../../store/unit/unit.query';
import { QuantityType } from '../../../../store/quantity-type/quantity-type.model';
import { QuantityTypeService } from '../../../../store/quantity-type/quantity-type.service';
import { QuantityTypeQuery } from '../../../../store/quantity-type/quantity-type.query';
import { EcoSystemManagerResolver } from '../../../services/ecosystem-resolver.service';
import { DialogService } from 'primeng/dynamicdialog';
import { first } from 'rxjs/operators';
import { UnitCreateComponent } from '../../content/unit-create/unit-create.component';

@Component({
  selector: 'app-unit-page',
  templateUrl: './unit-page.component.html',
  styleUrls: ['./unit-page.component.scss'],
  providers: [DialogService],
})
export class UnitPageComponent implements OnInit {

  unit$: Observable<Unit>;
  quantityType$: Observable<QuantityType>;

  constructor(private activatedRoute: ActivatedRoute, private ecoSystemManagerResolver: EcoSystemManagerResolver,
              private unitService: UnitService, private unitQuery: UnitQuery, private dialogService: DialogService,
              private quantityTypeService: QuantityTypeService, private quantityTypeQuery: QuantityTypeQuery) {
  }

  ngOnInit(): void {
    this.resolve();
  }

  resolve(): void {
    this.ecoSystemManagerResolver.resolve(this.activatedRoute);
    const unitId = this.activatedRoute.snapshot.paramMap.get('unitId');
    if (unitId != null) {
      this.unitService.setActive(unitId);
      this.unit$ = this.unitQuery.selectActive();
      this.unit$.subscribe((unit) => {
        this.quantityTypeService.setActive(unit?.quantityTypeId);
        this.quantityType$ = this.quantityTypeQuery.selectActive();
      });
    }
  }

  showDialog() {
    this.unit$.pipe(first()).subscribe((unit) => {
      const dialogRef = this.dialogService.open(UnitCreateComponent, {
        header: 'Edit Unit', width: '50%', data: { unit, editMode: true }
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
        this.unitService.editUnit(unit.quantityTypeId, unit.id, patchedUnit).subscribe();
      });
    }
  }
}
