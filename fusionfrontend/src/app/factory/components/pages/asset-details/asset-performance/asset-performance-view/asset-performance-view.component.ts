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
import { StatusHours } from '../../../../../../services/kairos-status-aggregation.model';
import { OispDeviceStatus } from '../../../../../../services/kairos.model';
import { EnumHelpers } from '../../../../../../common/utils/enum-helpers';
import { KairosStatusAggregationService } from '../../../../../../services/kairos-status-aggregation.service';
import { FactoryAssetDetailsWithFields } from '../../../../../../store/factory-asset-details/factory-asset-details.model';


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

  factoryAssetDetailsWithFields: FactoryAssetDetailsWithFields[];
  fullyLoadedAssets$ = new Subject<FactoryAssetDetailsWithFields[]>();

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
        this.factoryAssetDetailsWithFields = assetWithHours;
        this.updateAggregatedStatusHours();
      }
      this.isLoaded = assetWithHours !== null;
    });
  }

  private initViewMode() {
    this.viewMode = AssetPerformanceViewMode.PERFORMANCE;
  }

  private updateAssets(assetDetailsWithFields: FactoryAssetDetailsWithFields) {
    this.factoryAssetDetailsWithFields = [assetDetailsWithFields];
    if (this.factoryAssetDetailsWithFields.length < 1) {
      console.warn('[equipment efficiency page]: No assets found');
    }
    this.addStatusHoursToAssets();

    if (this.assetsWithStatus === 0) {
      this.fullyLoadedAssets$.next(this.factoryAssetDetailsWithFields);
    }
  }

  private addStatusHoursToAssets(): void {
    this.assetsWithStatus = 0;
    this.loadedStatusCount = 0;

    this.factoryAssetDetailsWithFields.forEach(assetWithFields => {
      if (KairosStatusAggregationService.getStatusFieldOfAsset(assetWithFields) != null) {
        this.assetsWithStatus++;
        this.kairosStatusAggregationService.selectHoursPerStatusOfAsset(assetWithFields, new Date(Date.now()))
          .subscribe(assetStatusHours => this.updateStatusHoursOfAsset(assetWithFields, assetStatusHours));
      }
    });
  }

  private updateStatusHoursOfAsset(assetWithFields: FactoryAssetDetailsWithFields, statusHours: StatusHours[]) {
    assetWithFields.statusHours = statusHours;
    this.loadedStatusCount++;
    if (this.assetsWithStatus === this.loadedStatusCount) {
      this.fullyLoadedAssets$.next(this.factoryAssetDetailsWithFields);
    }
  }

  private updateAggregatedStatusHours() {
    if (this.factoryAssetDetailsWithFields) {
      const aggregatedStatusHours = this.getNewAggregatedStatusHours();
      for (const assetWithField of this.factoryAssetDetailsWithFields) {
        if (assetWithField.statusHours) {
          assetWithField.statusHours.forEach(statusHours => {
            aggregatedStatusHours[statusHours.status].hours += statusHours.hours;
          });
        }
      }
      this.aggregatedStatusHours$.next(aggregatedStatusHours);
    }
  }

  private getNewAggregatedStatusHours(): StatusHours[] {
    const aggregatedStatusHours: StatusHours[] = [];
    for (let i = 0; i < this.enumHelpers.getIterableArray(OispDeviceStatus).length; i++) {
      aggregatedStatusHours.push({ status: i as OispDeviceStatus, hours: 0 });
    }
    return aggregatedStatusHours;
  }

  onChangeRoute(): Promise<boolean> {
    const newRoute = ['..', this.viewMode];
    return this.router.navigate(newRoute, { relativeTo: RouteHelpers.getActiveRouteLastChild(this.activatedRoute) });
  }
}
