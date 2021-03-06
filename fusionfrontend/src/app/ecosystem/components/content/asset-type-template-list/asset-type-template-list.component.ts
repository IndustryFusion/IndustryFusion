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

import { BaseListComponent } from '../base/base-list/base-list.component';
import { AssetTypeTemplateQuery } from '../../../../store/asset-type-template/asset-type-template.query';
import { AssetTypeTemplateService } from '../../../../store/asset-type-template/asset-type-template.service';

@Component({
  selector: 'app-asset-type-template-list',
  templateUrl: './asset-type-template-list.component.html',
  styleUrls: ['./asset-type-template-list.component.scss']
})
export class AssetTypeTemplateListComponent extends BaseListComponent implements OnInit, OnDestroy {

  titleMapping:
    { [k: string]: string } = { '=0': 'No asset type templates.', '=1': '# Asset type template', other: '# Asset type templates' };

  editBarMapping:
    { [k: string]: string } = {
      '=0': 'No asset type templates selected',
      '=1': '# Asset type template selected',
      other: '# Asset type templates selected'
    };

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public assetTypeTemplateQuery: AssetTypeTemplateQuery,
    public assetTypeTemplateService: AssetTypeTemplateService) {
      super(route, router, assetTypeTemplateQuery, assetTypeTemplateService);
     }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    this.assetTypeTemplateQuery.resetError();
  }
}
