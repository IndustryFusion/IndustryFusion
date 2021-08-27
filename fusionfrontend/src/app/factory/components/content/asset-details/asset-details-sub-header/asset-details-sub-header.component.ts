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
import { Observable } from 'rxjs';
import { FactoryResolver } from '../../../../services/factory-resolver.service';
import { AssetQuery } from '../../../../../store/asset/asset.query';
import { ID } from '@datorama/akita';
import { FactoryAssetDetailsWithFields } from '../../../../../store/factory-asset-details/factory-asset-details.model';

@Component({
  selector: 'app-asset-details-sub-header',
  templateUrl: './asset-details-sub-header.component.html',
  styleUrls: ['./asset-details-sub-header.component.scss']
})
export class AssetDetailsSubHeaderComponent implements OnInit {

  route: string;
  assetId: ID;
  asset$: Observable<FactoryAssetDetailsWithFields>;

  constructor(public activatedRoute: ActivatedRoute,
              private router: Router,
              private factoryResolver: FactoryResolver,
              private assetQuery: AssetQuery) {
  }

  ngOnInit() {
    this.assetQuery.selectLoading();
    this.assetId = this.assetQuery.getActiveId();
    this.asset$ = this.factoryResolver.assetWithDetailsAndFields$;
  }

  onRouteClick(subroute: string): Promise<boolean> {
    return this.router.navigate(['..', subroute], { relativeTo: this.getActiveRouteLastChild() });
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
