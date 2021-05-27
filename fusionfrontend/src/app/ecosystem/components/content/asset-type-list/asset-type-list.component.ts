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
import { BaseListComponent } from '../base/base-list/base-list.component';
import { AssetTypeDetailsService } from '../../../../store/asset-type-details/asset-type-details.service';
import { AssetTypeDetailsQuery } from '../../../../store/asset-type-details/asset-type-details.query';

@Component({
  selector: 'app-asset-type-list',
  templateUrl: './asset-type-list.component.html',
  styleUrls: ['./asset-type-list.component.scss']
})
export class AssetTypeListComponent extends BaseListComponent implements OnInit, OnDestroy {

  titleMapping:
    { [k: string]: string } = { '=0': 'No asset types.', '=1': '# Asset type', other: '# Asset types' };

  editBarMapping:
    { [k: string]: string } = {
      '=0': 'No asset type templates selected',
      '=1': '# Asset type template selected',
      other: '# Asset type templates selected'
    };

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public assetTypeDetailsQuery: AssetTypeDetailsQuery,
    public assetTypeDetailsService: AssetTypeDetailsService) {
    super(route, router, assetTypeDetailsQuery, assetTypeDetailsService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    this.assetTypeDetailsQuery.resetError();
  }
}
