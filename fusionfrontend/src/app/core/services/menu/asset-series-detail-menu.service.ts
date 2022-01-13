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
import { DialogService } from 'primeng/dynamicdialog';
import { AssetWizardComponent } from '../../../fleet/components/content/asset-wizard/asset-wizard.component';
import { AssetSeriesWizardComponent } from '../../../fleet/components/content/asset-series-wizard/asset-series-wizard.component';
import { CompanyQuery } from '../../store/company/company.query';
import { TranslateService } from '@ngx-translate/core';
import { FleetAssetDetails } from '../../store/fleet-asset-details/fleet-asset-details.model';
import { ID } from '@datorama/akita';

@Injectable({
  providedIn: 'root'
})
export class AssetSeriesDetailMenuService {

  constructor(private dialogService: DialogService,
              private companyQuery: CompanyQuery,
              private translate: TranslateService) {
  }

  public showCreateAssetWizardAssetSeriesPrefilled(assetSeriesId: ID, createCallback: (FleetAssetDetails) => any) {
    const ref = this.dialogService.open(AssetWizardComponent, {
      data: {
        prefilledAssetSeriesId: assetSeriesId,
      },
      header: this.translate.instant('APP.CORE.SERVICES.ASSET_SERIES_DETAILS_MENU.DIGITAL_TWIN_CREATOR_FOR_ASSETS'),
      width: '80%'
    });

    ref.onClose.subscribe((newAssetDetails: FleetAssetDetails) => {
      if (newAssetDetails) {
        createCallback(newAssetDetails);
      }
    });
  }

  public showEditWizard(assetSeriesId: string, updateCallback: () => any) {
    const dynamicDialogRef = this.dialogService.open(AssetSeriesWizardComponent, {
      data: {
        companyId: this.companyQuery.getActiveId(),
        assetSeriesId,
      },
      width: '90%',
      header: this.translate.instant('APP.CORE.SERVICES.ASSET_SERIES_DETAILS_MENU.ASSET_SERIES_IMPLEMENTATION'),
    });

    dynamicDialogRef.onClose.subscribe(() => updateCallback());
  }

  public showDeleteDialog(confirmationService: ConfirmationService, dialogKey: string, assetSeriesName: string, acceptCallback: () => any) {
    confirmationService.confirm({
      key: dialogKey,
      message: this.translate.instant('APP.CORE.SERVICES.ASSET_SERIES_DETAILS_MENU.CONFIRMATION_DIALOG.MESSAGE',
        { itemToDelete: assetSeriesName}),
      header: this.translate.instant('APP.CORE.SERVICES.ASSET_SERIES_DETAILS_MENU.CONFIRMATION_DIALOG.HEADER'),
      icon: 'pi pi-exclamation-triangle',
      accept: acceptCallback,
      reject: () => { }
    });
  }
}
