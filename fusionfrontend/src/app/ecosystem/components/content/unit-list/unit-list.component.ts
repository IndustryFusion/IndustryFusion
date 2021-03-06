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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseListComponent } from '../base/base-list/base-list.component';
import { UnitQuery } from '../../../../store/unit/unit.query';
import { UnitService } from '../../../../store/unit/unit.service';
import { Unit } from '../../../../store/unit/unit.model';

@Component({
  selector: 'app-unit-list',
  templateUrl: './unit-list.component.html',
  styleUrls: ['./unit-list.component.scss']
})
export class UnitListComponent extends BaseListComponent implements OnInit, OnDestroy {

  titleMapping:
  { [k: string]: string} = { '=0': 'No Units', '=1': '# Unit', other: '# Units' };

  editBarMapping:
    { [k: string]: string } = {
      '=0': 'No units selected',
      '=1': '# unit selected',
      other: '# units selected'
    };

  constructor(public route: ActivatedRoute, public router: Router, public unitQuery: UnitQuery, public unitService: UnitService) {
    super(route, router, unitQuery, unitService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    this.unitQuery.resetError();
  }

  onConfirmModal(unit: Unit) {
    this.unitService.createUnit(unit.quantityTypeId, unit).subscribe();
    this.shouldShowCreateItem = false;
  }

  deleteItems() {
    this.selected.forEach(id => {
      const unit = this.unitQuery.getEntity(id);
      this.unitService.deleteUnit(unit.quantityTypeId, id).subscribe(() => this.selected.delete(id));
    });
  }
}
