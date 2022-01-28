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
import { AssetPerformanceViewMode } from '../AssetPerformanceViewMode';
import { RouteHelpers } from '../../../../../../core/helpers/route-helpers';
import { ActivatedRoute, Router } from '@angular/router';
import { FactoryResolver } from '../../../../../services/factory-resolver.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { StatusHours, StatusHoursOneDay } from '../../../../../../core/models/kairos-status-aggregation.model';
import { EnumHelpers } from '../../../../../../core/helpers/enum-helpers';
import { KairosStatusAggregationService } from '../../../../../../core/services/api/kairos-status-aggregation.service';
import {
  FactoryAssetDetailsWithFields
} from '../../../../../../core/store/factory-asset-details/factory-asset-details.model';
import * as moment from 'moment';
import { StatusHoursHelper } from '../../../../../../core/helpers/status-hours-helper';


@Component({
  selector: 'app-asset-performance-view',
  templateUrl: './asset-performance-view.component.html',
  styleUrls: ['./asset-performance-view.component.scss']
})

export class AssetPerformanceViewComponent implements OnInit {
  @Input()
  viewModeOptions;

  viewMode: AssetPerformanceViewMode;
  aggregatedStatusHoursToday$: BehaviorSubject<StatusHours[]> = new BehaviorSubject<StatusHours[]>([]);
  statusHoursThreeDaysLoaded$ = new Subject<FactoryAssetDetailsWithFields[]>();

  lastThreeDatesAsc: Date[];
  yBarChartLabelsThreeDaysAsc: string[];
  statusHoursOfLastThreeDaysAsc: StatusHoursOneDay[];

  isLoaded = false;
  private statusCountToLoad: number;
  private loadedStatusCount = 0;
  private assetDetailsWithFields$: Observable<FactoryAssetDetailsWithFields>;
  private assetDetailsWithFields: FactoryAssetDetailsWithFields;

  private readonly statusHoursHelper: StatusHoursHelper;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private factoryResolver: FactoryResolver,
              private kairosStatusAggregationService: KairosStatusAggregationService,
              enumHelpers: EnumHelpers) {
    this.statusHoursHelper = new StatusHoursHelper(enumHelpers);
  }

  ngOnInit() {
    this.factoryResolver.resolve(this.activatedRoute);
    this.initViewMode();
    this.loadStatusHoursWhenAssetIsLoaded();
    this.aggregateHoursWhenLoaded();
  }

  private initViewMode(): void {
    this.viewMode = AssetPerformanceViewMode.PERFORMANCE;
  }

  private loadStatusHoursWhenAssetIsLoaded(): void {
    this.assetDetailsWithFields$ = this.factoryResolver.assetWithDetailsAndFields$;
    this.assetDetailsWithFields$.subscribe(assetDetailsWithFields => {
      this.assetDetailsWithFields = assetDetailsWithFields;
      this.initStatusHoursLastThreeDays();
    });
  }

  private initStatusHoursLastThreeDays(): void {
    this.statusCountToLoad = this.loadedStatusCount = 0;
    this.lastThreeDatesAsc = [];
    this.yBarChartLabelsThreeDaysAsc = [];
    this.statusHoursOfLastThreeDaysAsc = [StatusHoursOneDay.empty(), StatusHoursOneDay.empty(), StatusHoursOneDay.empty()];

    if (KairosStatusAggregationService.getStatusFieldOfAsset(this.assetDetailsWithFields) != null) {
      const indizesThreeDays: (0 | 1 | 2)[] = [0, 1, 2];
      for (const index of indizesThreeDays) {
        const date: Date = new Date(Date.now());
        this.lastThreeDatesAsc.push(new Date(date.setDate(date.getDate() - index)));
        this.yBarChartLabelsThreeDaysAsc.push(moment(this.lastThreeDatesAsc[index]).format('DD.MM'));
        this.statusCountToLoad++;

        this.kairosStatusAggregationService.selectHoursPerStatusOfAsset(this.assetDetailsWithFields, this.lastThreeDatesAsc[index], [])
          .subscribe(statusHoursOfOneDay => this.insertStatusHoursOfOneDayAsc(index, statusHoursOfOneDay));
      }
    }
    this.yBarChartLabelsThreeDaysAsc.reverse();

    if (this.statusCountToLoad === 0) {
      this.statusHoursThreeDaysLoaded$.next();
    }
  }

  private insertStatusHoursOfOneDayAsc(index: 0 | 1 | 2, statusHours: StatusHours[]): void {
    this.statusHoursOfLastThreeDaysAsc[2 - index] = new StatusHoursOneDay(statusHours);
    this.loadedStatusCount++;
    if (this.statusCountToLoad === this.loadedStatusCount) {
      this.statusHoursThreeDaysLoaded$.next();
    }
  }

  private aggregateHoursWhenLoaded(): void {
    this.statusHoursThreeDaysLoaded$.subscribe(() => {
      if (this.statusHoursOfLastThreeDaysAsc && this.statusHoursOfLastThreeDaysAsc.length === 3) {
        this.updateAggregatedStatusHoursToday();
        this.isLoaded = true;
      }
    });
  }

  private updateAggregatedStatusHoursToday(): void {
    const aggregatedStatusHoursToday = this.statusHoursHelper.getAggregatedStatusHours([this.statusHoursOfLastThreeDaysAsc[2]]);
    this.aggregatedStatusHoursToday$.next(aggregatedStatusHoursToday);
  }

  onChangeRoute(): Promise<boolean> {
    const newRoute = ['..', this.viewMode];
    return this.router.navigate(newRoute, { relativeTo: RouteHelpers.getActiveRouteLastChild(this.activatedRoute) });
  }
}
