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
import { Location } from '@angular/common';
import { RouteHelpers } from '../../../../../common/utils/route-helpers';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AssetSeriesDetailsQuery } from '../../../../../store/asset-series-details/asset-series-details.query';
import { AssetSeriesDetails } from '../../../../../store/asset-series-details/asset-series-details.model';

@Component({
  selector: 'app-asset-series-instance-sub-header',
  templateUrl: './asset-series-instance-sub-header.component.html',
  styleUrls: ['./asset-series-instance-sub-header.component.scss']
})
export class AssetSeriesInstanceSubHeaderComponent implements OnInit, OnDestroy {

  assetId: ID;
  assetSeries: AssetSeriesDetails;

  private unSubscribe$ = new Subject<void>();

  constructor(public activatedRoute: ActivatedRoute,
              private router: Router,
              private routingLocation: Location,
              private assetSeriesDetailsQuery: AssetSeriesDetailsQuery) {
  }

  ngOnInit() {
    this.activatedRoute.fragment.subscribe(() => {
      this.updateAsset();
    });
    this.updateAsset();
  }

  updateAsset() {
    this.assetId = this.assetSeriesDetailsQuery.getActiveId();
    this.assetSeriesDetailsQuery.selectActive()
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(assetSeries => {
        this.assetSeries = assetSeries;
      });
  }

  onRouteClick(subroute: string, subroute2: string = null): Promise<boolean> {
    let newRoute = subroute2 ? ['..', subroute, subroute2] : ['..', subroute];
    if (this.routingLocation.path().match(`\/assets\/[0-9]*$`)) {
      newRoute = newRoute.slice(1, newRoute.length);
    }

    const relativeToRoute = RouteHelpers.getActiveRouteLastChild(this.activatedRoute);
    return this.router.navigate(newRoute, { relativeTo: relativeToRoute });
  }

  isRouteActive(subroute: string, useAsDefault: boolean = false): boolean {
    const snapshot = RouteHelpers.getActiveRouteLastChild(this.activatedRoute).snapshot;
    if (useAsDefault && snapshot.url.join('/').endsWith(`${this.assetId}`)) {
      return true;
    }
    return snapshot.url.map(segment => segment.path).includes(subroute);
  }

  isDigitalNameplate() {
    return this.isRouteActive('digital-nameplate');
  }

  ngOnDestroy() {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

}
