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
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { FactoryAssetDetailsResolver } from '../../../../../../core/resolvers/factory-asset-details.resolver';
import { FactoryAssetDetailsWithFields } from '../../../../../../core/store/factory-asset-details/factory-asset-details.model';
import { AssetPerformanceViewMode } from '../AssetPerformanceViewMode';
import { RouteHelpers } from '../../../../../../core/helpers/route-helpers';

@Component({
  selector: 'app-asset-realtime-view',
  templateUrl: './asset-realtime-view.component.html',
  styleUrls: ['./asset-realtime-view.component.scss']
})
export class AssetRealtimeViewComponent implements OnInit {

  @Input()
  viewModeOptions;

  viewMode: AssetPerformanceViewMode;
  asset$: Observable<FactoryAssetDetailsWithFields>;

  constructor(private factoryResolver: FactoryResolver,
              private factoryAssetDetailsResolver: FactoryAssetDetailsResolver,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.factoryResolver.resolve(this.activatedRoute);
    this.factoryAssetDetailsResolver.resolve(this.activatedRoute.snapshot);
    this.asset$ = this.factoryResolver.assetWithDetailsAndFieldsAndValues$;

    this.initViewMode();
  }

  private initViewMode(): void {
    this.viewMode = AssetPerformanceViewMode.REALTIME;
  }

  onChangeRoute(): Promise<boolean> {
    const newRoute = ['..', this.viewMode];
    return this.router.navigate(newRoute, { relativeTo: RouteHelpers.getActiveRouteLastChild(this.activatedRoute) });
  }
}
