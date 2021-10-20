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
import { AssetSeriesDetails } from '../../../../../store/asset-series-details/asset-series-details.model';
import { ItemOptionsMenuType } from '../../../../../components/ui/item-options-menu/item-options-menu.type';

@Component({
  selector: 'app-asset-series-details-info',
  templateUrl: './asset-series-details-info.component.html',
  styleUrls: ['./asset-series-details-info.component.scss']
})
export class AssetSeriesDetailsInfoComponent implements OnInit {

  @Input()
  assetSeries: AssetSeriesDetails;

  dropdownMenuOptions: ItemOptionsMenuType[] = [
    ItemOptionsMenuType.UPDATE, ItemOptionsMenuType.CREATE, ItemOptionsMenuType.EDIT, ItemOptionsMenuType.DELETE
  ];

  constructor() {
  }

  ngOnInit() {

  }
}
