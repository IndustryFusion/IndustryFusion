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

import { Location as loc } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { Asset, AssetWithFields } from 'src/app/store/asset/asset.model';
import { AssetQuery } from 'src/app/store/asset/asset.query';
import { Location } from 'src/app/store/location/location.model';
import { Room } from 'src/app/store/room/room.model';

@Component({
  selector: 'app-assets-grid-page',
  templateUrl: './assets-grid-page.component.html',
  styleUrls: ['./assets-grid-page.component.scss']
})
export class AssetsGridPageComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  location$: Observable<Location>;
  rooms$: Observable<Room[]>;
  assets$: Observable<Asset[]>;
  assetsWithFields$: Observable<AssetWithFields[]>;

  constructor(
    private assetQuery: AssetQuery,
    private routingLocation: loc,
    private factoryResolver: FactoryResolver,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading$ = this.assetQuery.selectLoading();
    this.factoryResolver.resolve(this.activatedRoute);
    this.location$ = this.factoryResolver.location$;
    this.rooms$ = this.factoryResolver.rooms$;
    this.assets$ = this.factoryResolver.assets$;
    this.assetsWithFields$ = this.factoryResolver.assetsWithFields$;
  }

  ngOnDestroy() {
  }

  goBack() {
    this.routingLocation.back();
  }
}
