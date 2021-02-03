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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AssetTypeQuery } from '../../../../store/asset-type/asset-type.query';
import { BaseListComponent } from '../base/base-list/base-list.component';
import { AssetTypeService } from '../../../../store/asset-type/asset-type.service';

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
    public assetTypeQuery: AssetTypeQuery,
    public assetTypeService: AssetTypeService) {
    super(route, router, assetTypeQuery, assetTypeService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    this.assetTypeQuery.resetError();
  }

  folderView() {
    // TODO
  }

}
