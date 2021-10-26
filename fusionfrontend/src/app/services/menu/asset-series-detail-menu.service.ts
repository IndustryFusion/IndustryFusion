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
import { FactoryAssetDetails } from '../../store/factory-asset-details/factory-asset-details.model';
import { DialogService } from 'primeng/dynamicdialog';
import { AssetWizardComponent } from '../../fleet/components/content/asset-wizard/asset-wizard.component';
import { AssetSeriesWizardComponent } from '../../fleet/components/content/asset-series-wizard/asset-series-wizard.component';
import { CompanyQuery } from '../../store/company/company.query';

@Injectable({
  providedIn: 'root'
})
export class AssetSeriesDetailMenuService {

  constructor(private dialogService: DialogService,
              private companyQuery: CompanyQuery) {
  }

  public showCreateAssetFromAssetSeries(assetSeriesId: string, createCallback: (FactoryAssetDetails) => any) {
    const ref = this.dialogService.open(AssetWizardComponent, {
      data: {
        companyId: this.companyQuery.getActiveId(),
        prefilledAssetSeriesId: assetSeriesId,
      },
      header: 'Digital Twin Creator for Assets',
      width: '80%'
    });

    ref.onClose.subscribe((newAssetDetails: FactoryAssetDetails) => {
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
      header: 'AssetSeries Implementation',
    });

    dynamicDialogRef.onClose.subscribe(() => updateCallback());
  }

  public showDeleteDialog(confirmationService: ConfirmationService, dialogKey: string, assetSeriesName: string, acceptCallback: () => any) {
    confirmationService.confirm({
      key: dialogKey,
      message: 'Are you sure you want to delete the Asset Serie ' + assetSeriesName + '?',
      header: 'Delete Asset Serie Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: acceptCallback,
      reject: () => { }
    });
  }
}
