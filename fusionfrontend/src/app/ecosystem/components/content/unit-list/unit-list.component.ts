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
import { UnitQuery } from '../../../../core/store/unit/unit.query';
import { UnitService } from '../../../../core/store/unit/unit.service';
import { Unit } from '../../../../core/store/unit/unit.model';
import { DialogService } from 'primeng/dynamicdialog';
import { UnitDialogComponent } from '../unit-dialog/unit-dialog.component';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { DialogType } from '../../../../shared/models/dialog-type.model';
import { ID } from '@datorama/akita';
import { ConfirmationService } from 'primeng/api';
import { QuantityTypeService } from '../../../../core/store/quantity-type/quantity-type.service';
import { TableHelper } from '../../../../core/helpers/table-helper';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-unit-list',
  templateUrl: './unit-list.component.html',
  styleUrls: ['./unit-list.component.scss'],
  providers: [DialogService, ConfirmationService]
})
export class UnitListComponent implements OnInit, OnDestroy {

  @Input() units$: Observable<Unit[]>;
  @Input() parentQuantityTypeId: ID | null;

  titleMapping:
    { [k: string]: string } = { '=0': this.translate.instant('APP.ECOSYSTEM.UNIT_LIST.NO_UNITS'), '=1': '# ' +
      this.translate.instant('APP.COMMON.TERMS.UNIT'), other: '# ' + this.translate.instant('APP.ECOSYSTEM.UNIT_LIST.UNITS') };

  rowsPerPageOptions: number[] = TableHelper.rowsPerPageOptions;
  rowCount = TableHelper.defaultRowCount;

  units: Unit[];
  displayedUnits: Unit[];
  unitsSearchedByName: Unit[];
  unitsSearchedBySymbol: Unit[];
  unitsSearchedByQuantity: Unit[];

  activeListItem: Unit;


  constructor(
    private unitQuery: UnitQuery,
    private unitService: UnitService,
    private quantityTypeService: QuantityTypeService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    public formBuilder: FormBuilder,
    public translate: TranslateService) {
  }

  ngOnInit() {
    if (this.units$ == null) {
      this.units$ = this.unitQuery.selectAll();
    }
    this.units$.subscribe(units => {
      this.displayedUnits = this.units = this.unitsSearchedByName = this.unitsSearchedBySymbol
        = this.unitsSearchedByQuantity = units;
    });

    this.rowCount = TableHelper.getValidRowCountFromUrl(this.rowCount, this.activatedRoute.snapshot, this.router);
  }

  ngOnDestroy() {
    this.unitQuery.resetError();
  }

  setActiveRow(unit?: Unit) {
    if (unit) {
      this.activeListItem = unit;
    }
  }

  searchUnitByName(event: Unit[]): void {
    this.unitsSearchedByName = event;
    this.updateDisplayedUnits();
  }

  searchUnitBySymbol(event: Unit[]): void {
    this.unitsSearchedBySymbol = event;
    this.updateDisplayedUnits();
  }

  searchUnitByQuantity(event: Unit[]): void {
    this.unitsSearchedByQuantity = event;
    this.updateDisplayedUnits();
  }

  private updateDisplayedUnits(): void {
    this.displayedUnits = this.units;
    this.displayedUnits = this.unitsSearchedByName.filter(unitSearchedByName => this.unitsSearchedBySymbol.filter(
      unitSearchedBySymbol => this.unitsSearchedByQuantity.includes(unitSearchedBySymbol)).includes(unitSearchedByName));
  }

  showCreateDialog() {
    const ref = this.dialogService.open(UnitDialogComponent, {
      header: this.translate.instant('APP.ECOSYSTEM.UNIT_LIST.HEADER.CREATE'), width: '50%',
      data: { unit: null, type: DialogType.CREATE, prefilledQuantityTypeId: this.parentQuantityTypeId }
    });
    ref.onClose.subscribe((unit) => {
      this.onConfirmModal(unit);
    });
  }

  showEditDialog(): void {
    const dialogRef = this.dialogService.open(UnitDialogComponent, {
      header: this.translate.instant('APP.ECOSYSTEM.UNIT_LIST.HEADER.EDIT'), width: '50%',
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
      message: this.translate.instant('APP.ECOSYSTEM.UNIT_LIST.CONFIRMATION_DIALOG.MESSAGE', { itemToDelete: this.activeListItem.name }),
      header: this.translate.instant('APP.ECOSYSTEM.UNIT_LIST.CONFIRMATION_DIALOG.HEADER'),
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

  updateRowCountInUrl(rowCount: number): void {
    TableHelper.updateRowCountInUrl(rowCount, this.router);
  }
}
