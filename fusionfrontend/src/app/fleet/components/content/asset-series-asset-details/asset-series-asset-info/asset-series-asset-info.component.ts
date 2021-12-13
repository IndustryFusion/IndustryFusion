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
import { ItemOptionsMenuType } from '../../../../../shared/components/ui/item-options-menu/item-options-menu.type';
import { FactoryAssetDetailsWithFields } from '../../../../../core/store/factory-asset-details/factory-asset-details.model';
import { Observable } from 'rxjs';
import { ImageService } from '../../../../../core/services/api/image.service';
import { CompanyQuery } from '../../../../../core/store/company/company.query';
import { ID } from '@datorama/akita';

@Component({
  selector: 'app-asset-series-asset-info',
  templateUrl: './asset-series-asset-info.component.html',
  styleUrls: ['./asset-series-asset-info.component.scss']
})
export class AssetSeriesAssetInfoComponent implements OnInit {

  @Input()
  asset$: Observable<FactoryAssetDetailsWithFields>;

  dropdownMenuOptions: ItemOptionsMenuType[] = [];

  assetIdOfImage: ID;
  assetImage: string;

  constructor(private companyQuery: CompanyQuery,
              private imageService: ImageService) {
  }

  ngOnInit() {
    this.loadImageForChangedAsset();
  }

  private loadImageForChangedAsset() {
    this.asset$.subscribe(asset => {
      if (asset.id !== this.assetIdOfImage) {
        this.assetIdOfImage = asset.id;

        const companyId = this.companyQuery.getActiveId();
        this.imageService.getImageAsUriSchemeString(companyId, asset.imageKey).subscribe(imageText => {
          this.assetImage = imageText;
        });
      }
    });
  }
}
