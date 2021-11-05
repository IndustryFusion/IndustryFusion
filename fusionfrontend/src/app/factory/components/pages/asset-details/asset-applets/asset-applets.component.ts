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
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { Device } from '../../../../../core/store/oisp/oisp-device/oisp-device.model';
import { OispDeviceQuery } from '../../../../../core/store/oisp/oisp-device/oisp-device.query';
import { FactoryAssetDetailsQuery } from '../../../../../core/store/factory-asset-details/factory-asset-details.query';

@Component({
  selector: 'app-asset-applets',
  templateUrl: './asset-applets.component.html',
  styleUrls: ['./asset-applets.component.scss']
})
export class AssetAppletsComponent implements OnInit {

  public showActive = true;
  device: Device;

  constructor(
    activatedRoute: ActivatedRoute,
    oispDeviceQuery: OispDeviceQuery,
    factoryAssetDetailsQuery: FactoryAssetDetailsQuery
  ) {
    factoryAssetDetailsQuery.waitForActive().subscribe(asset =>
      this.device = oispDeviceQuery.getDeviceOfAsset(asset.externalName)
    );
    this.showActive = this.isRouteActive('active', activatedRoute.snapshot);
  }

  ngOnInit(): void {
  }

  isRouteActive(subroute: string, activatedRouteSnapshot: ActivatedRouteSnapshot): boolean {
    return activatedRouteSnapshot.url.map(segment => segment.path).includes(subroute);
  }
}
