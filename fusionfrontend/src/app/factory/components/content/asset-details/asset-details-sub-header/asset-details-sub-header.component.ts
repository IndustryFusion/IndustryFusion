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
import { FactoryAssetDetailsWithFields } from '../../../../../store/factory-asset-details/factory-asset-details.model';
import { Location } from '@angular/common';
import { FactoryAssetDetailsQuery } from '../../../../../store/factory-asset-details/factory-asset-details.query';
import { FactoryComposedQuery } from '../../../../../store/composed/factory-composed.query';

@Component({
  selector: 'app-asset-details-sub-header',
  templateUrl: './asset-details-sub-header.component.html',
  styleUrls: ['./asset-details-sub-header.component.scss']
})
export class AssetDetailsSubHeaderComponent implements OnInit {

  assetId: ID;
  asset: FactoryAssetDetailsWithFields;
  hasSubsystems = false;

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
    this.factoryComposedQuery.selectActiveAssetsWithFieldInstanceDetails().subscribe(asset => {
      this.asset = asset;
      this.hasSubsystems = asset.subsystemIds?.length > 0;
    });
  }

  onRouteClick(subroute: string): Promise<boolean> {
    let newRoute = ['..', subroute];
    if (this.routingLocation.path().match(`\/assets\/[0-9]*$`)) {
      newRoute = [subroute];
    }
    return this.router.navigate(newRoute, { relativeTo: this.getActiveRouteLastChild() });
  }

  isRouteActive(subroute: string): boolean {
    const snapshot = this.getActiveRouteLastChild().snapshot;
    return snapshot.url.map(segment => segment.path).includes(subroute);
  }

  private getActiveRouteLastChild() {
    let route = this.activatedRoute;
    while (route.firstChild !== null) {
      route = route.firstChild;
    }
    return route;
  }
}
