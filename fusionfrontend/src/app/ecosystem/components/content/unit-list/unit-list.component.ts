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
import { ActivatedRoute, Router } from '@angular/router';

import { BaseListComponent } from '../base/base-list/base-list.component';
import { UnitQuery } from '../../../../store/unit/unit.query';
import { UnitService } from '../../../../store/unit/unit.service';
import { Unit } from '../../../../store/unit/unit.model';
import { DialogService } from 'primeng/dynamicdialog';
import { UnitDialogComponent } from '../unit-dialog/unit-dialog.component';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { DialogType } from '../../../../common/models/dialog-type.model';

@Component({
  selector: 'app-unit-list',
  templateUrl: './unit-list.component.html',
  styleUrls: ['./unit-list.component.scss'],
  providers: [DialogService]
})
export class UnitListComponent extends BaseListComponent implements OnInit, OnDestroy {

  @Input()
  optionalItems$: Observable<Unit[]>;

  titleMapping:
    { [k: string]: string } = { '=0': 'No Units', '=1': '# Unit', other: '# Units' };

  editBarMapping:
    { [k: string]: string } = {
    '=0': 'No units selected',
    '=1': '# unit selected',
    other: '# units selected'
  };

  constructor(public route: ActivatedRoute, public router: Router, public unitQuery: UnitQuery,
              public unitService: UnitService, public dialogService: DialogService, public formBuilder: FormBuilder) {
    super(route, router, unitQuery, unitService);
  }

  ngOnInit() {
    super.ngOnInit();

    if (this.optionalItems$ != null) {
      this.items$ = this.optionalItems$;
    }
  }

  ngOnDestroy() {
    this.unitQuery.resetError();
  }

  showDialog() {
    const ref = this.dialogService.open(UnitDialogComponent, {
      header: 'Create new Unit', width: '50%',
      data: { unit: null, type: DialogType.CREATE }
    });
    ref.onClose.subscribe((unit) => {
      this.onConfirmModal(unit);
    });
  }

  onConfirmModal(unit: Unit) {
    if (unit) {
      this.unitService.createUnit(unit.quantityTypeId, unit).subscribe();
    }
  }

  deleteItems() {
    this.selected.forEach(id => {
      const unit = this.unitQuery.getEntity(id);
      this.unitService.deleteUnit(unit.quantityTypeId, id).subscribe(() => this.selected.delete(id));
    });
  }
}
