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

import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AssetWizardComponent } from '../../../fleet/components/content/asset-wizard/asset-wizard.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Asset } from '../../store/asset/asset.model';
import { FleetAssetDetailsResolver } from '../../resolvers/fleet-asset-details.resolver';
import { FleetAssetDetailsService } from '../../store/fleet-asset-details/fleet-asset-details.service';
import { FieldDetailsService } from '../../store/field-details/field-details.service';
import { FactorySiteService } from '../../store/factory-site/factory-site.service';
import { RoomService } from '../../store/room/room.service';
import { AssetService } from '../../store/asset/asset.service';

@Injectable({
  providedIn: 'root'
})
export class FleetAssetDetailMenuService {

  constructor(
    private dialogService: DialogService,
    private translate: TranslateService,
    private confirmationService: ConfirmationService,
    private fleetAssetDetailsResolver: FleetAssetDetailsResolver,
    private fleetAssetDetailsService: FleetAssetDetailsService,
    private fieldDetailsService: FieldDetailsService,
    private factorySiteService: FactorySiteService,
    private assetService: AssetService,
    private roomService: RoomService) {
  }

  public showEditWizardAndRefresh(fleetAsset: Asset) {
    const assetWizardRef = this.dialogService.open(AssetWizardComponent, {
      data: {
        asset: fleetAsset,
        prefilledAssetSeriesId: fleetAsset.assetSeriesId,
      },
      header: this.translate.instant('APP.FLEET.PAGES.ASSET_SERIES_OVERVIEW.DIGITAL_TWIN_CREATOR_FOR_ASSETS'),
      width: '80%'
    });

    assetWizardRef.onClose.subscribe(asset => this.refreshDataIfSaved(asset));
  }

  private refreshDataIfSaved(asset?: Asset) {
    if (!asset) {
      return;
    }

    if (asset.room && asset.room.factorySiteId) {
      this.roomService.getRoom(asset.companyId, asset.room.factorySiteId, asset.room.id, true).subscribe();
      this.factorySiteService.getFactorySite(asset.companyId, asset.room.factorySiteId, true).subscribe();
    }

    this.fleetAssetDetailsResolver.resolveFromComponent().subscribe(() => {
      this.fleetAssetDetailsService.setActive(asset.id);
      this.assetService.setActive(asset.id);
    });

    this.fieldDetailsService.getFieldsOfAsset(asset.companyId, asset.id, true).subscribe();
  }

  public showDeleteDialog(dialogKey: string, assetName: string, acceptCallback: () => any) {
    this.confirmationService.confirm({
      key: dialogKey,
      message: this.translate.instant('APP.CORE.SERVICES.ASSET_DETAILS_MENU.CONFIRMATION_DIALOG.MESSAGE', { itemToDelete: assetName}),
      header: this.translate.instant('APP.CORE.SERVICES.ASSET_DETAILS_MENU.CONFIRMATION_DIALOG.HEADER'),
      icon: 'pi pi-exclamation-triangle',
      accept: acceptCallback,
      reject: () => { }
    });
  }
}
