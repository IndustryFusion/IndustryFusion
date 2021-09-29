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
import { RouteHelpers } from '../../../../../../common/utils/route-helpers';
import { ActivatedRoute, Router } from '@angular/router';
import { FactoryResolver } from '../../../../../services/factory-resolver.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { StatusHours, StatusHoursOneDay } from '../../../../../../services/kairos-status-aggregation.model';
import { EnumHelpers } from '../../../../../../common/utils/enum-helpers';
import { KairosStatusAggregationService } from '../../../../../../services/kairos-status-aggregation.service';
import { FactoryAssetDetailsWithFields } from '../../../../../../store/factory-asset-details/factory-asset-details.model';
import * as moment from 'moment';
import { EquipmentEfficiencyHelper } from '../../../../../../common/utils/equipment-efficiency-helper';


@Component({
  selector: 'app-asset-performance-view',
  templateUrl: './asset-performance-view.component.html',
  styleUrls: ['./asset-performance-view.component.scss']
})

export class AssetPerformanceViewComponent implements OnInit {
  @Input()
  viewModeOptions;

  viewMode: AssetPerformanceViewMode;
  aggregatedStatusHours$: BehaviorSubject<StatusHours[]> = new BehaviorSubject<StatusHours[]>([]);

  datesOfStatusHours: Date[];
  reversedYBarChartLabels: string[];
  assetDetailsWithFieldsThreeDays: FactoryAssetDetailsWithFields[];
  fullyLoadedAssets$ = new Subject<FactoryAssetDetailsWithFields[]>();
  assetStatusHoursOfThreeDays: StatusHoursOneDay[];

  isLoaded = false;
  private assetsWithStatus: number;
  private loadedStatusCount = 0;
  private assetWithDetailsAndFields$: Observable<FactoryAssetDetailsWithFields>;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private factoryResolver: FactoryResolver,
              private kairosStatusAggregationService: KairosStatusAggregationService,
              private enumHelpers: EnumHelpers) {
  }

  ngOnInit() {
    this.factoryResolver.resolve(this.activatedRoute);
    this.initViewMode();
    this.assetWithDetailsAndFields$ = this.factoryResolver.assetWithDetailsAndFields$;
    this.assetWithDetailsAndFields$.subscribe(assetDetailsWithFields => {
      this.updateAssets(assetDetailsWithFields);
    });

    this.fullyLoadedAssets$.subscribe(assetWithHours => {
      if (assetWithHours) {
        this.assetDetailsWithFieldsThreeDays = assetWithHours;
        this.updateAggregatedStatusHours();
        this.updateStatusHoursForBarChart();
        this.isLoaded = true;
      }
    });
  }

  private initViewMode() {
    this.viewMode = AssetPerformanceViewMode.PERFORMANCE;
  }

  private updateAssets(assetDetailsWithFields: FactoryAssetDetailsWithFields) {
    const assetToday = assetDetailsWithFields;
    const assetYesterday: FactoryAssetDetailsWithFields = JSON.parse(JSON.stringify(assetDetailsWithFields));
    const assetDayBeforeYesterday: FactoryAssetDetailsWithFields = JSON.parse(JSON.stringify(assetDetailsWithFields));
    this.assetDetailsWithFieldsThreeDays = [assetToday, assetYesterday, assetDayBeforeYesterday];
    if (this.assetDetailsWithFieldsThreeDays.length < 1) {
      console.warn('[equipment efficiency page]: No assets found');
    }
    this.addStatusHoursToAssets();

    if (this.assetsWithStatus === 0) {
      this.fullyLoadedAssets$.next(this.assetDetailsWithFieldsThreeDays);
    }
  }

  private addStatusHoursToAssets(): void {
    this.assetsWithStatus = 0;
    this.loadedStatusCount = 0;
    this.datesOfStatusHours = [];
    this.reversedYBarChartLabels = [];

    for (let i = 0; i < this.assetDetailsWithFieldsThreeDays.length; i++) {
      const assetWithFields =  this.assetDetailsWithFieldsThreeDays[i];
      if (KairosStatusAggregationService.getStatusFieldOfAsset(assetWithFields) != null) {
        const date: Date = new Date(Date.now());
        this.datesOfStatusHours.push(new Date(date.setDate(date.getDate() - i)));
        this.reversedYBarChartLabels.push(moment( this.datesOfStatusHours[i]).format('DD.MM'));
        this.assetsWithStatus++;

        this.kairosStatusAggregationService.selectHoursPerStatusOfAsset(assetWithFields, this.datesOfStatusHours[i])
          .subscribe(assetStatusHours => this.updateStatusHoursOfAsset(assetWithFields, assetStatusHours));
      }
    }
    this.reversedYBarChartLabels.reverse();
  }

  private updateStatusHoursOfAsset(assetWithFields: FactoryAssetDetailsWithFields, statusHours: StatusHours[]) {
    assetWithFields.statusHoursOneDay = new StatusHoursOneDay(statusHours);
    this.loadedStatusCount++;
    if (this.assetsWithStatus === this.loadedStatusCount) {
      this.fullyLoadedAssets$.next(this.assetDetailsWithFieldsThreeDays);
    }
  }

  private updateAggregatedStatusHours() {
    if (this.assetDetailsWithFieldsThreeDays && this.assetDetailsWithFieldsThreeDays.length > 0) {
      const aggregatedStatusHours = EquipmentEfficiencyHelper.getAggregatedStatusHours([this.assetDetailsWithFieldsThreeDays[0]],
        this.enumHelpers);
      this.aggregatedStatusHours$.next(aggregatedStatusHours);
    }
  }

  onChangeRoute(): Promise<boolean> {
    const newRoute = ['..', this.viewMode];
    return this.router.navigate(newRoute, { relativeTo: RouteHelpers.getActiveRouteLastChild(this.activatedRoute) });
  }

  private updateStatusHoursForBarChart(): void {
    this.assetStatusHoursOfThreeDays = null;

    if (this.assetDetailsWithFieldsThreeDays && this.assetDetailsWithFieldsThreeDays.length === 3) {
      const statusHoursOfDays: StatusHoursOneDay[] = [];
      for (let index = 2; index >= 0; index--) {
        if (!this.assetDetailsWithFieldsThreeDays[index].statusHoursOneDay) {
          return;
        }
        statusHoursOfDays.push(this.assetDetailsWithFieldsThreeDays[index].statusHoursOneDay);
      }
      this.assetStatusHoursOfThreeDays = statusHoursOfDays;
    }
  }
}
