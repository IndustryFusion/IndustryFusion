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
import { ActivatedRoute } from '@angular/router';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { RouteHelpers } from '../../../../../core/helpers/route-helpers';
import { AssetPerformanceViewMode } from './AssetPerformanceViewMode';

@Component({
  selector: 'app-asset-performance',
  templateUrl: './asset-performance.component.html',
  styleUrls: ['./asset-performance.component.scss']
})
export class AssetPerformanceComponent implements OnInit {

  viewMode: AssetPerformanceViewMode;
  AssetPerformanceViewMode = AssetPerformanceViewMode;

  viewModeOptions = [{ name: 'Realtime View', value: AssetPerformanceViewMode.REALTIME },
    { name: 'Historical View', value: AssetPerformanceViewMode.HISTORICAL },
    { name: 'Performance View', value: AssetPerformanceViewMode.PERFORMANCE }];

  constructor(private activatedRoute: ActivatedRoute,
              private factoryResolver: FactoryResolver) {
  }

  ngOnInit() {
    this.factoryResolver.resolve(this.activatedRoute);
    this.initViewMode();
  }

  private initViewMode() {
    if (RouteHelpers.isRouteActive('realtime', this.activatedRoute)) {
      this.viewMode = AssetPerformanceViewMode.REALTIME;
    }
    else if (RouteHelpers.isRouteActive('historical', this.activatedRoute)) {
      this.viewMode = AssetPerformanceViewMode.HISTORICAL;
    }
    else if (RouteHelpers.isRouteActive('performance', this.activatedRoute)) {
      this.viewMode = AssetPerformanceViewMode.PERFORMANCE;
    }
  }

}
