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
import { FactoryAssetDetailMenuService } from '../../../../../core/services/menu/factory-asset-detail-menu.service';
import { ConfirmationService } from 'primeng/api';
import { AssetService } from '../../../../../core/store/asset/asset.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AssetWizardComponent } from '../../asset-wizard/asset-wizard.component';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-asset-series-asset-info',
  templateUrl: './asset-series-asset-info.component.html',
  styleUrls: ['./asset-series-asset-info.component.scss']
})
export class AssetSeriesAssetInfoComponent implements OnInit {

  @Input()
  asset$: Observable<FactoryAssetDetailsWithFields>;

  assetIdOfImage: ID;
  assetImage: string;
  asset: FactoryAssetDetailsWithFields;

  ItemOptionsMenuType = ItemOptionsMenuType;

  constructor(private companyQuery: CompanyQuery,
              private imageService: ImageService,
              private assetService: AssetService,
              private router: Router,
              private routingLocation: Location,
              private confirmationService: ConfirmationService,
              private assetDetailMenuService: FactoryAssetDetailMenuService,
              private dialogService: DialogService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.loadImageForChangedAsset();
  }

  private loadImageForChangedAsset() {
    this.asset$.subscribe(asset => {
      this.asset = asset;
      if (asset.id !== this.assetIdOfImage) {
        this.assetIdOfImage = asset.id;

        const companyId = this.companyQuery.getActiveId();
        this.imageService.getImageAsUriSchemeString(companyId, asset.imageKey).subscribe(imageText => {
          this.assetImage = imageText;
        });
      }
    });
  }

  openEditWizard() {
    this.dialogService.open(AssetWizardComponent, {
      data: {
        asset: this.asset,
        prefilledAssetSeriesId: this.asset.assetSeriesId,
      },
      header: this.translate.instant('APP.FLEET.PAGES.ASSET_SERIES_OVERVIEW.DIGITAL_TWIN_CREATOR_FOR_ASSETS'),
      width: '80%'
    });

    // assetWizardRef.onClose.subscribe(() => this.resolve(this.route));
  }

  openDeleteDialog() {
    this.assetDetailMenuService.showDeleteDialog(this.confirmationService, 'asset-series-asset-delete-dialog-detail',
      this.asset.name, () => this.deleteAsset(this.asset.id));
  }

  private deleteAsset(id: ID) {
    this.assetService.removeCompanyAsset(this.companyQuery.getActiveId(), id).subscribe(() => {
      const currentUrlSeparated = this.routingLocation.path().split('/');
      const newRoutingLocation = currentUrlSeparated.slice(0, currentUrlSeparated.findIndex(elem => elem === 'assets') + 1);
      this.router.navigateByUrl(newRoutingLocation.join('/')).catch(error => console.warn('Routing error: ', error));
    });
  }
}
