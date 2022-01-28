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
import { FactoryAssetDetailsWithFields } from '../../../../core/store/factory-asset-details/factory-asset-details.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { StatusHours } from '../../../../core/models/kairos-status-aggregation.model';
import { EnumHelpers } from '../../../../core/helpers/enum-helpers';
import { StatusHoursHelper } from '../../../../core/helpers/status-hours-helper';
import { FactorySite, Shift } from '../../../../core/store/factory-site/factory-site.model';
import { FactorySiteQuery } from '../../../../core/store/factory-site/factory-site.query';
import { CompanyQuery } from '../../../../core/store/company/company.query';
import { Day } from '../../../../core/models/days.model';
import { FactorySiteResolverWithShiftSettings } from '../../../../core/resolvers/factory-site.resolver';

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

  @Output()
  shiftsChanged = new EventEmitter<Shift[]>();

  isLoaded = false;
  averageOfAllStatusHours$: BehaviorSubject<StatusHours[]> = new BehaviorSubject<StatusHours[]>([]);
  factorySites$: Observable<FactorySite[]>;

  private readonly statusHoursHelper: StatusHoursHelper;

  constructor(enumHelpers: EnumHelpers,
              private factorySiteQuery: FactorySiteQuery,
              private factorySiteResolverWithShiftSettings: FactorySiteResolverWithShiftSettings,
              private companyQuery: CompanyQuery) {
    this.statusHoursHelper = new StatusHoursHelper(enumHelpers);
  }

  ngOnInit() {
    this.factorySiteResolverWithShiftSettings.resolveFromComponent().subscribe();
    this.factorySites$ = this.factorySiteQuery.selectFactorySitesOfCompanyInFactoryManager(this.companyQuery.getActiveId());

    this.fullyLoadedAssets$.subscribe(assetWithHours => {
      if (assetWithHours) {
        this.factoryAssetDetailsWithFields = assetWithHours;
        this.updateAggregatedStatusHoursOfDate();
      }
      this.isLoaded = assetWithHours !== null;
    });
  }

  private updateAggregatedStatusHoursOfDate(): void {
    if (this.factoryAssetDetailsWithFields) {
      const statusHoursOfAssets = this.factoryAssetDetailsWithFields.map(asset => asset.statusHoursOneDay);
      const averageOfAllStatusHours = this.statusHoursHelper.getAverageOfAggregatedStatusHours(statusHoursOfAssets);

      this.averageOfAllStatusHours$.next(averageOfAllStatusHours);
    }
  }

  getDayFromDate(): Day {
    switch (this.date.getDay()) {
      case 0: return Day.SUNDAY;
      case 1: return Day.MONDAY;
      case 2: return Day.TUESDAY;
      case 3: return Day.WEDNESDAY;
      case 4: return Day.THURSDAY;
      case 5: return Day.FRIDAY;
      case 6: return Day.SATURDAY;
    }
  }

  onShiftsChanged(selectedShifts: Shift[]): void {
    this.shiftsChanged.emit(selectedShifts);
  }
}
