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
import { Observable, Subject } from 'rxjs';
import { StatusHours } from '../../../../services/kairos-status-aggregation.model';
import { OispDeviceStatus } from '../../../../services/kairos.model';
import { EnumHelpers } from '../../../../common/utils/enum-helpers';

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
  isLoading$: Subject<boolean>;

  @Input()
  date: Date;

  @Output()
  dateChanged = new EventEmitter<Date>();

  isLoaded = false;
  aggregatedStatusHours$: Subject<StatusHours[]> = new Subject<StatusHours[]>();

  constructor(private enumHelpers: EnumHelpers) {
  }

  ngOnInit(): void {
    this.isLoading$.subscribe(isLoading => {
      this.isLoaded = isLoading;
      if (!isLoading) {
        this.updateAggregatedStatusHours();
        this.isLoaded = true;
      }
    });
  }

  private updateAggregatedStatusHours() {
    if (this.factoryAssetDetailsWithFields) {
      const aggregatedStatusHours = this.getNewAggregatedStatusHours();
      this.factoryAssetDetailsWithFields.forEach(assetWithField => {
        if (assetWithField.statusHours) {
          assetWithField.statusHours.forEach(statusHours => {
            aggregatedStatusHours[statusHours.status].hours += statusHours.hours;
          });
        }
      });

      this.aggregatedStatusHours$.next(aggregatedStatusHours);
      console.log('aggregatedStatusHours', aggregatedStatusHours);
    }
  }

  private getNewAggregatedStatusHours(): StatusHours[] {
    const aggregatedStatusHours: StatusHours[] = [];
    for (let i = 0; i < this.enumHelpers.getIterableArray(OispDeviceStatus).length; i++) {
      aggregatedStatusHours.push({ status: i as OispDeviceStatus, hours: 0 });
    }
    return aggregatedStatusHours;
  }
}
