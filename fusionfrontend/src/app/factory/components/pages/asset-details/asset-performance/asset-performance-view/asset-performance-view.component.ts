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
import { BehaviorSubject, Observable } from 'rxjs';
import {
  FactoryAssetDetailsWithFields
} from '../../../../../../core/store/factory-asset-details/factory-asset-details.model';
import { StatusHours } from '../../../../../../core/models/kairos-status-aggregation.model';
import { SegmentationType } from '../../../../../../shared/models/segmentation-type.model';


@Component({
  selector: 'app-asset-performance-view',
  templateUrl: './asset-performance-view.component.html',
  styleUrls: ['./asset-performance-view.component.scss']
})

export class AssetPerformanceViewComponent implements OnInit {
  @Input()
  viewModeOptions;

  isLoaded = false;
  viewMode: AssetPerformanceViewMode;
  assetDetailsWithFields$: Observable<FactoryAssetDetailsWithFields>;
  aggregatedStatusHoursToday$: BehaviorSubject<StatusHours[]> = new BehaviorSubject<StatusHours[]>([]);

  SegmentationType = SegmentationType;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private factoryResolver: FactoryResolver) {
  }

  ngOnInit() {
    this.factoryResolver.resolve(this.activatedRoute);
    this.initViewMode();
    this.assetDetailsWithFields$ = this.factoryResolver.assetWithDetailsAndFields$;
  }

  private initViewMode(): void {
    this.viewMode = AssetPerformanceViewMode.PERFORMANCE;
  }

  onLoaded() {
    this.isLoaded = true;
  }

  onChangeRoute(): Promise<boolean> {
    const newRoute = ['..', this.viewMode];
    return this.router.navigate(newRoute, { relativeTo: RouteHelpers.getActiveRouteLastChild(this.activatedRoute) });
  }

  onStatusHoursOfTodayAggregated(statusHoursOfToday: StatusHours[]) {
    this.aggregatedStatusHoursToday$.next(statusHoursOfToday);
  }
}
