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


@Component({
  selector: 'app-asset-performance-view',
  templateUrl: './asset-performance-view.component.html',
  styleUrls: ['./asset-performance-view.component.scss']
})

export class AssetPerformanceViewComponent implements OnInit {
  @Input()
  viewModeOptions;

  viewMode: AssetPerformanceViewMode;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private factoryResolver: FactoryResolver) {
  }

  ngOnInit() {
    this.factoryResolver.resolve(this.activatedRoute);
    this.initViewMode();
  }

  private initViewMode() {
    this.viewMode = AssetPerformanceViewMode.PERFORMANCE;
  }

  onChangeRoute(): Promise<boolean> {
    const newRoute = ['..', this.viewMode];
    return this.router.navigate(newRoute, { relativeTo: RouteHelpers.getActiveRouteLastChild(this.activatedRoute) });
  }
}
