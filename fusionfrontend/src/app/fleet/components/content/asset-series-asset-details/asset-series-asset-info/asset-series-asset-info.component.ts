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
import { FleetAssetDetailsResolver } from '../../../../../core/resolvers/fleet-asset-details.resolver';
import { FleetAssetDetailsService } from '../../../../../core/store/fleet-asset-details/fleet-asset-details.service';
import { FleetAssetDetailsWithFields } from '../../../../../core/store/fleet-asset-details/fleet-asset-details.model';
import { RoomService } from '../../../../../core/store/room/room.service';
import { Asset } from '../../../../../core/store/asset/asset.model';
import { FactorySiteService } from '../../../../../core/store/factory-site/factory-site.service';
import { FieldDetailsService } from '../../../../../core/store/field-details/field-details.service';

@Component({
  selector: 'app-asset-series-asset-info',
  templateUrl: './asset-series-asset-info.component.html',
  styleUrls: ['./asset-series-asset-info.component.scss']
})
export class AssetSeriesAssetInfoComponent implements OnInit {

  @Input()
  assetWithFields$: Observable<FleetAssetDetailsWithFields>;

  assetIdOfImage: ID;
  prevImageKey: string;
  assetImage: string;
  assetWithFields: FleetAssetDetailsWithFields;

  ItemOptionsMenuType = ItemOptionsMenuType;

  constructor(private companyQuery: CompanyQuery,
              private imageService: ImageService,
              private assetService: AssetService,
              private router: Router,
              private routingLocation: Location,
              private confirmationService: ConfirmationService,
              private assetDetailMenuService: FactoryAssetDetailMenuService,
              private fleetAssetDetailsResolver: FleetAssetDetailsResolver,
              private fleetAssetDetailsService: FleetAssetDetailsService,
              private fieldDetailsService: FieldDetailsService,
              private factorySiteService: FactorySiteService,
              private roomService: RoomService,
              private dialogService: DialogService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.loadImageForChangedAsset();
  }

  private loadImageForChangedAsset() {
    this.assetWithFields$.subscribe(asset => {
      this.assetWithFields = asset;
      if (asset.id !== this.assetIdOfImage || asset.imageKey !== this.prevImageKey) {
        this.assetIdOfImage = asset.id;
        this.prevImageKey = asset.imageKey;

        const companyId = this.companyQuery.getActiveId();
        this.imageService.getImageAsUriSchemeString(companyId, asset.imageKey).subscribe(imageText => {
          this.assetImage = imageText;
        });
      }
    });
  }

  openEditWizard() {
    const assetWizardRef = this.dialogService.open(AssetWizardComponent, {
      data: {
        asset: this.assetWithFields,
        prefilledAssetSeriesId: this.assetWithFields.assetSeriesId,
      },
      header: this.translate.instant('APP.FLEET.PAGES.ASSET_SERIES_OVERVIEW.DIGITAL_TWIN_CREATOR_FOR_ASSETS'),
      width: '80%'
    });

    assetWizardRef.onClose.subscribe((asset?: Asset) => {
      this.refreshData(asset);
    });
  }

  private refreshData(asset?: Asset) {
    if (!asset) {
      return;
    }

    if (asset.room && asset.room.factorySiteId) {
      this.roomService.getRoom(asset.companyId, asset.room.factorySiteId, asset.room.id, true).subscribe();
      this.factorySiteService.getFactorySite(asset.companyId, asset.room.factorySiteId, true).subscribe();
    }

    this.fleetAssetDetailsResolver.resolveFromComponent().subscribe(() => {
      this.fleetAssetDetailsService.setActive(this.assetWithFields.id);
      this.assetService.setActive(this.assetWithFields.id);
    });

    this.fieldDetailsService.getFieldsOfAsset(asset.companyId, asset.id, true).subscribe();
  }

  openDeleteDialog() {
    this.assetDetailMenuService.showDeleteDialog(this.confirmationService, 'asset-series-asset-delete-dialog-detail',
      this.assetWithFields.name, () => this.deleteAsset(this.assetWithFields.id));
  }

  private deleteAsset(id: ID) {
    this.assetService.removeCompanyAsset(this.companyQuery.getActiveId(), id).subscribe(() => {
      const currentUrlSeparated = this.routingLocation.path().split('/');
      const newRoutingLocation = currentUrlSeparated.slice(0, currentUrlSeparated.findIndex(elem => elem === 'assets') + 1);
      this.router.navigateByUrl(newRoutingLocation.join('/')).catch(error => console.warn('Routing error: ', error));
    });
  }
}
