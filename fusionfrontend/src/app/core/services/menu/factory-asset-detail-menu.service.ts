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
import {
  AssetModalMode,
  AssetModalType,
  FactoryAssetDetails,
  FactoryAssetDetailsWithFields
} from '../../store/factory-asset-details/factory-asset-details.model';
import { AssetInstantiationComponent } from '../../../factory/components/content/asset-instantiation/asset-instantiation.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WizardHelper } from '../../helpers/wizard-helper';
import { DialogService } from 'primeng/dynamicdialog';
import { FactorySite } from '../../store/factory-site/factory-site.model';
import { Room } from '../../store/room/room.model';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class FactoryAssetDetailMenuService {

  constructor(
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private confirmationService: ConfirmationService) {
  }

  // TODO: Has to be extracted into Dialog/AssetInstantiationComponent (IF-429)
  public createAssetDetailsForm(factoryAsset?: FactoryAssetDetailsWithFields): FormGroup {
    const assetDetailsForm = this.formBuilder.group({
      id: [null],
      version: [],
      roomId: ['', WizardHelper.requiredTextValidator],
      name: ['', WizardHelper.requiredTextValidator],
      description: [''],
      imageKey: [''],
      manufacturer: ['', WizardHelper.requiredTextValidator],
      assetSeriesName: ['', WizardHelper.requiredTextValidator],
      category: ['', WizardHelper.requiredTextValidator],
      roomName: ['', WizardHelper.requiredTextValidator],
      factorySiteName: ['', WizardHelper.requiredTextValidator]
    });
    if (factoryAsset) {
      assetDetailsForm.patchValue(factoryAsset);
    }
    return assetDetailsForm;
  }

  public showEditWizard(asset: FactoryAssetDetailsWithFields, factorySite: FactorySite, factorySites: FactorySite[],
                        rooms: Room[], closeCallback: () => any, updateCallback: (FactoryAssetDetails) => any) {
    const assetDetailsForm = this.createAssetDetailsForm(asset);
    const ref = this.dialogService.open(AssetInstantiationComponent, {
      data: {
        assetDetailsForm,
        assetToBeEdited: asset,
        factorySites,
        factorySite,
        rooms,
        activeModalType: AssetModalType.customizeAsset,
        activeModalMode: AssetModalMode.editAssetMode
      },
      header: this.translate.instant('APP.CORE.SERVICES.ASSET_DETAILS_MENU.GENERAL_INFORMATION'),
    });

    ref.onClose.subscribe((assetFormValues: FactoryAssetDetails) => {
      closeCallback();
      if (assetFormValues) {
        updateCallback(assetFormValues);
      }
    });
  }

  public showAssignRoomDialog(assetToEdit: FactoryAssetDetailsWithFields, factorySite: FactorySite,
                              factorySites: FactorySite[], rooms: Room[], modalType: AssetModalType,
                              modalMode: AssetModalMode, header: string, updateCallback: (FactoryAssetDetails) => any) {
    const assetDetailsForm = this.createAssetDetailsForm(assetToEdit);
    const ref = this.dialogService.open(AssetInstantiationComponent, {
      data: {
        assetDetailsForm,
        assetToBeEdited: assetToEdit,
        factorySites,
        factorySite,
        rooms,
        activeModalType: modalType,
        activeModalMode: modalMode
      },
      header
    });

    ref.onClose.subscribe((newAssetDetails: FactoryAssetDetails) => {
      if (newAssetDetails) {
        updateCallback(newAssetDetails);
      }
    });
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
