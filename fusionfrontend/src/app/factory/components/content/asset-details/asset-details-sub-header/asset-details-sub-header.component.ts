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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ID } from '@datorama/akita';
import { FactoryAssetDetailsWithFields } from '../../../../../store/factory-asset-details/factory-asset-details.model';
import { Location } from '@angular/common';
import { FactoryAssetDetailsQuery } from '../../../../../store/factory-asset-details/factory-asset-details.query';
import { FactoryComposedQuery } from '../../../../../store/composed/factory-composed.query';
import { RouteHelpers } from '../../../../../common/utils/route-helpers';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-asset-details-sub-header',
  templateUrl: './asset-details-sub-header.component.html',
  styleUrls: ['./asset-details-sub-header.component.scss']
})
export class AssetDetailsSubHeaderComponent implements OnInit, OnDestroy {

  assetId: ID;
  asset: FactoryAssetDetailsWithFields;
  hasSubsystems = false;

  private unSubscribe$ = new Subject<void>();

  constructor(public activatedRoute: ActivatedRoute,
              private router: Router,
              private routingLocation: Location,
              private factoryAssetDetailsQuery: FactoryAssetDetailsQuery,
              private factoryComposedQuery: FactoryComposedQuery) {
  }

  ngOnInit() {
    this.activatedRoute.fragment.subscribe(() => {
      this.updateAsset();
    });
    this.factoryAssetDetailsQuery.selectLoading();
    this.updateAsset();
  }

  updateAsset() {
    this.assetId = this.factoryAssetDetailsQuery.getActiveId();
    this.factoryComposedQuery.selectActiveAssetWithFieldInstanceDetails()
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(asset => {
        this.asset = asset;
        this.hasSubsystems = asset.subsystemIds?.length > 0;
      });
  }

  onRouteClick(subroute: string, subroute2: string = null): Promise<boolean> {
    let newRoute = subroute2 ? ['..', subroute, subroute2] : ['..', subroute];
    if (RouteHelpers.matchFullRoute(this.routingLocation.path(), `\/assets\/[0-9]*`) || this.endsUrlWithTwoSubroutes()) {
      newRoute = newRoute.slice(1, newRoute.length);
    }

    const relativeToRoute = this.endsUrlWithTwoSubroutes() ? RouteHelpers.getActiveRouteSecondLastChild(this.activatedRoute) :
      RouteHelpers.getActiveRouteLastChild(this.activatedRoute);
    return this.router.navigate(newRoute, { relativeTo: relativeToRoute });
  }

  isRouteActive(subroute: string, useAsDefault: boolean = false): boolean {
    const url = this.routingLocation.path();
    if (useAsDefault && url.endsWith(`${this.assetId}`)) {
      return true;
    }
    return url.split('/').includes(subroute);
  }

  endsUrlWithTwoSubroutes() {
    return this.isPerformance() || this.isNotifications() || this.isApplets();
  }

  isPerformance() {
    return this.isRouteActive('realtime') || this.isRouteActive('historical') || this.isRouteActive('performance');
  }

  isNotifications() {
    return this.isRouteActive('open') || this.isRouteActive('cleared');
  }

  isApplets() {
    return this.isRouteActive('active') || this.isRouteActive('archiv');
  }

  ngOnDestroy() {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

}
