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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UnitQuery } from '../../../../store/unit/unit.query';
import { UnitService } from '../../../../store/unit/unit.service';
import { Unit } from '../../../../store/unit/unit.model';
import { DialogService } from 'primeng/dynamicdialog';
import { UnitDialogComponent } from '../unit-dialog/unit-dialog.component';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { DialogType } from '../../../../common/models/dialog-type.model';
import { ID } from '@datorama/akita';
import { ConfirmationService } from 'primeng/api';
import { QuantityTypeService } from '../../../../store/quantity-type/quantity-type.service';

@Component({
  selector: 'app-unit-list',
  templateUrl: './unit-list.component.html',
  styleUrls: ['./unit-list.component.scss'],
  providers: [DialogService, ConfirmationService]
})
export class UnitListComponent implements OnInit, OnDestroy {



  @Input() units$: Observable<Unit[]>;
  @Input() parentQuantityTypeId: ID | null;

  units: Unit[];
  displayedUnits: Unit[];
  unitsSearchedByName: Unit[];
  unitsSearchedBySymbol: Unit[];
  unitsSearchedByQuantity: Unit[];

  activeListItem: Unit;

  titleMapping:
    { [k: string]: string } = { '=0': 'No Units', '=1': '# Unit', other: '# Units' };

  constructor(
    public unitQuery: UnitQuery,
    public unitService: UnitService,
    public quantityTypeService: QuantityTypeService,
    public dialogService: DialogService,
    public confirmationService: ConfirmationService,
    public formBuilder: FormBuilder) {
  }

  ngOnInit() {
    if (this.units$ == null) {
      this.units$ = this.unitQuery.selectAll();
    }
    this.units$.subscribe(units => {
      this.displayedUnits = this.units = this.unitsSearchedByName = this.unitsSearchedBySymbol
        = this.unitsSearchedByQuantity = units;
    });
  }

  ngOnDestroy() {
    this.unitQuery.resetError();
  }

  setActiveRow(unit?: Unit) {
    if (unit) {
      this.activeListItem = unit;
    }
  }

  searchUnitByName(event?: Unit[]): void {
    this.unitsSearchedByName = event;
    this.updateDisplayedUnits();
  }

  searchUnitBySymbol(event?: Unit[]): void {
    this.unitsSearchedBySymbol = event;
    this.updateDisplayedUnits();
  }

  searchUnitByQuantity(event?: Unit[]): void {
    this.unitsSearchedByQuantity = event;
    this.updateDisplayedUnits();
  }

  private updateDisplayedUnits(): void {
    this.displayedUnits = this.units;
    this.displayedUnits = this.unitsSearchedByName.filter(unitSearchedByName => this.unitsSearchedBySymbol.filter(
      unitSearcedBySymbol => this.unitsSearchedByQuantity.includes(unitSearcedBySymbol)).includes(unitSearchedByName));
  }

  showCreateDialog() {
    const ref = this.dialogService.open(UnitDialogComponent, {
      header: 'Create new Unit', width: '50%',
      data: { unit: null, type: DialogType.CREATE, prefilledQuantityTypeId: this.parentQuantityTypeId }
    });
    ref.onClose.subscribe((unit) => {
      this.onConfirmModal(unit);
    });
  }

  showEditDialog(): void {
    const dialogRef = this.dialogService.open(UnitDialogComponent, {
      header: 'Edit Unit', width: '50%',
      data: { unit: this.activeListItem, type: DialogType.EDIT }
    });
    dialogRef.onClose.subscribe((unit) => {
      this.updateUnitIfPresent(unit);
    });
  }

  updateUnitIfPresent(unit: Unit): void {
    if (unit) {
      const patchedUnit = { ...this.activeListItem, ...unit };
      this.quantityTypeService.getItem(patchedUnit.quantityTypeId).toPromise().then((quantityType) => {
        patchedUnit.quantityType = quantityType;
        this.unitService.editUnit(this.activeListItem.quantityType.id, this.activeListItem.id, patchedUnit).subscribe();
      });
    }
  }

  onConfirmModal(unit: Unit) {
    if (unit) {
      this.unitService.createUnit(unit.quantityTypeId, unit).subscribe();
    }
  }

  showDeleteDialog() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the assetType ' + this.activeListItem.name + '?',
      header: 'Delete Asset Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteUnit(this.activeListItem);
      },
      reject: () => {
      }
    });
  }

  deleteUnit(unit: Unit) {
    this.unitService.deleteUnit(unit.quantityTypeId, unit.id).subscribe();
  }
}
