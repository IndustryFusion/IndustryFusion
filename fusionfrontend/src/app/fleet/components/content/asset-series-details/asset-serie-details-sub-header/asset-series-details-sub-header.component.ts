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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ID } from '@datorama/akita';
import { Location } from '@angular/common';
import { RouteHelpers } from '../../../../../core/helpers/route-helpers';
import { Observable } from 'rxjs';
import { AssetSeriesDetailsQuery } from '../../../../../core/store/asset-series-details/asset-series-details.query';
import { AssetSeriesDetails } from '../../../../../core/store/asset-series-details/asset-series-details.model';

@Component({
  selector: 'app-asset-series-details-sub-header',
  templateUrl: './asset-series-details-sub-header.component.html',
  styleUrls: ['./asset-series-details-sub-header.component.scss']
})
export class AssetSeriesDetailsSubHeaderComponent implements OnInit {

  assetSeriesID: ID;
  assetSeries$: Observable<AssetSeriesDetails>;

  constructor(public activatedRoute: ActivatedRoute,
              private router: Router,
              private routingLocation: Location,
              private assetSeriesDetailsQuery: AssetSeriesDetailsQuery) {
  }

  ngOnInit() {
    this.activatedRoute.fragment.subscribe(() => {
      this.updateAssetSeries();
    });
  }

  private updateAssetSeries() {
    this.assetSeriesID = this.assetSeriesDetailsQuery.getActiveId();
    this.assetSeries$ = this.assetSeriesDetailsQuery.waitForActives();
  }

  onRouteClick(subroute: string, subroute2: string = null): Promise<boolean> {
    let newRoute = subroute2 ? ['..', subroute, subroute2] : ['..', subroute];
    if (RouteHelpers.matchFullRoute(this.routingLocation.path(), `\/assets\/[0-9]*`)) {
      newRoute = newRoute.slice(1, newRoute.length);
    }

    const relativeToRoute = RouteHelpers.getActiveRouteLastChild(this.activatedRoute);
    return this.router.navigate(newRoute, { relativeTo: relativeToRoute });
  }

  isRouteActive(subroute: string, useAsDefault: boolean = false): boolean {
    const url = this.routingLocation.path();
    if (useAsDefault && url.endsWith(`${this.assetSeriesID}`)) {
      return true;
    }
    return url.split('/').includes(subroute);
  }


  isAssets() {
    return this.isRouteActive('assets', true);
  }
}
