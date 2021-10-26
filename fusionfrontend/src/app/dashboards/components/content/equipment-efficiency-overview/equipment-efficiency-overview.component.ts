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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FactoryAssetDetailsWithFields } from '../../../../store/factory-asset-details/factory-asset-details.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { StatusHours } from '../../../../services/api/kairos-status-aggregation.model';
import { EnumHelpers } from '../../../../common/utils/enum-helpers';
import { EquipmentEfficiencyHelper } from '../../../../common/utils/equipment-efficiency-helper';

@Component({
  selector: 'app-equipment-efficiency-overview',
  templateUrl: './equipment-efficiency-overview.component.html',
  styleUrls: ['./equipment-efficiency-overview.component.scss']
})
export class EquipmentEfficiencyOverviewComponent implements OnInit {

  @Input()
  factoryAssetDetailsWithFields$: Observable<FactoryAssetDetailsWithFields[]>;

  @Input()
  factoryAssetDetailsWithFields: FactoryAssetDetailsWithFields[];

  @Input()
  fullyLoadedAssets$: Subject<FactoryAssetDetailsWithFields[]>;

  @Input()
  date: Date;

  @Output()
  dateChanged = new EventEmitter<Date>();

  isLoaded = false;
  averageOfStatusHours$: BehaviorSubject<StatusHours[]> = new BehaviorSubject<StatusHours[]>([]);

  constructor(private enumHelpers: EnumHelpers) {
  }

  ngOnInit(): void {
    this.fullyLoadedAssets$.subscribe(assetWithHours => {
      if (assetWithHours) {
        this.factoryAssetDetailsWithFields = assetWithHours;
        this.updateAggregatedStatusHours();
      }
      this.isLoaded = assetWithHours !== null;
    });
  }

  private updateAggregatedStatusHours() {
    if (this.factoryAssetDetailsWithFields) {
      const aggregatedStatusHours = EquipmentEfficiencyHelper
        .getAggregatedStatusHours(this.factoryAssetDetailsWithFields, this.enumHelpers);
      const averageOfStatusHours = EquipmentEfficiencyHelper
        .getAverageOfAggregatedStatusHours(aggregatedStatusHours, this.factoryAssetDetailsWithFields);
      this.averageOfStatusHours$.next(averageOfStatusHours);
    }
  }

}
