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
import { ActivatedRoute, Router } from '@angular/router';

import { BaseListItemComponent } from '../base/base-list-item/base-list-item.component';
import { AssetTypeTemplate } from '../../../../store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateService } from '../../../../store/asset-type-template/asset-type-template.service';

@Component({
  selector: 'app-asset-type-template-list-item',
  templateUrl: './asset-type-template-list-item.component.html',
  styleUrls: ['./asset-type-template-list-item.component.scss']
})
export class AssetTypeTemplateListItemComponent extends BaseListItemComponent implements OnInit {

  @Input()
  item: AssetTypeTemplate;

  constructor(public route: ActivatedRoute, public router: Router, public assetTypeTemplateService: AssetTypeTemplateService) {
    super(route, router, assetTypeTemplateService);
  }

  ngOnInit() {
  }

}
