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

import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ID } from '@datorama/akita';
import { AssetSeriesService } from '../../../../core/store/asset-series/asset-series.service';
import { AssetSeries } from '../../../../core/store/asset-series/asset-series.model';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogType } from '../../../../shared/models/dialog-type.model';
import { AssetSeriesWizardStep } from './asset-series-wizard-step.model';
import { ConnectivityTypeResolver } from '../../../../core/resolvers/connectivity-type.resolver';
import { Company } from '../../../../core/store/company/company.model';
import { AssetType } from '../../../../core/store/asset-type/asset-type.model';
import { CompanyQuery } from '../../../../core/store/company/company.query';
import { AssetTypeTemplateQuery } from '../../../../core/store/asset-type-template/asset-type-template.query';
import { AssetTypeQuery } from '../../../../core/store/asset-type/asset-type.query';
import { AssetTypesResolver } from '../../../../core/resolvers/asset-types.resolver';
import { FieldsResolver } from '../../../../core/resolvers/fields-resolver';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetSeriesDetailsResolver } from '../../../../core/resolvers/asset-series-details.resolver';
import { AssetSeriesDetailsQuery } from '../../../../core/store/asset-series-details/asset-series-details.query';
import { WizardHelper } from '../../../../core/helpers/wizard-helper';
import { EnumHelpers } from '../../../../core/helpers/enum-helpers';
import { ImageService } from '../../../../core/services/api/storage/image.service';
import { AssetQuery } from '../../../../core/store/asset/asset.query';
import { AssetService } from '../../../../core/store/asset/asset.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-asset-series-wizard',
  templateUrl: './asset-series-wizard.component.html',
  styleUrls: ['./asset-series-wizard.component.scss']
})
export class AssetSeriesWizardComponent implements OnInit, OnDestroy {

  assetType: ID;
  companyId: ID;
  step: AssetSeriesWizardStep = AssetSeriesWizardStep.GENERAL_INFORMATION;
  totalSteps: number = this.enumHelpers.getIterableArray(AssetSeriesWizardStep).length;

  assetSeries: AssetSeries;
  assetSeriesForm: FormGroup;

  type: DialogType = DialogType.CREATE;
  connectivitySettingsValid: boolean;
  attributesValid: boolean;
  metricsValid: boolean;
  fieldSourcesCanBeDeleted: boolean;
  relatedManufacturer: Company;
  relatedAssetType: AssetType;

  assetSeriesImage: string = null;
  initialAssetSeriesImageKey: string;

  AssetSeriesCreateSteps = AssetSeriesWizardStep;

  constructor(private assetSeriesService: AssetSeriesService,
              private assetSeriesDetailsResolver: AssetSeriesDetailsResolver,
              private assetSeriesDetailsQuery: AssetSeriesDetailsQuery,
              private companyQuery: CompanyQuery,
              private assetTypeTemplateQuery: AssetTypeTemplateQuery,
              private assetTypeQuery: AssetTypeQuery,
              private assetQuery: AssetQuery,
              private assetService: AssetService,
              private assetTypesResolver: AssetTypesResolver,
              private changeDetectorRef: ChangeDetectorRef,
              private fieldsResolver: FieldsResolver,
              private formBuilder: FormBuilder,
              private enumHelpers: EnumHelpers,
              private connectivityTypeResolver: ConnectivityTypeResolver,
              private dialogConfig: DynamicDialogConfig,
              private imageService: ImageService,
              private dynamicDialogRef: DynamicDialogRef,
  ) {
    this.resolve();
    this.initFromConfig(dialogConfig);
  }

  private resolve() {
    this.fieldsResolver.resolve().subscribe();
    this.connectivityTypeResolver.resolve().subscribe();
    this.assetTypesResolver.resolve().subscribe();
    this.assetSeriesDetailsResolver.resolveFromComponent().subscribe();
  }

  private initFromConfig(dialogConfig: DynamicDialogConfig): void {
    this.companyId = dialogConfig.data.companyId;

    const assetSeriesId = this.dialogConfig.data.assetSeriesId;
    this.type = assetSeriesId ? DialogType.EDIT : DialogType.CREATE;

    if (this.type === DialogType.EDIT) {
      this.assetSeriesService.getAssetSeries(this.companyId, assetSeriesId)
        .subscribe(assetSeries => {
          this.initialAssetSeriesImageKey = assetSeries.imageKey;
          this.initAssetSeries(assetSeries);
        });
    } else if (this.type === DialogType.CREATE) {
      this.initialAssetSeriesImageKey = ImageService.DEFAULT_ASSET_AND_SERIES_IMAGE_KEY;
    }
  }

  ngOnInit() {
    this.createAssetSeriesFormGroup();
    this.setIfFieldSourcesCanBeDeleted();
  }

  private setIfFieldSourcesCanBeDeleted() {
    this.fieldSourcesCanBeDeleted = true;
    if (this.type === DialogType.EDIT) {
      this.assetSeriesDetailsQuery.selectAssetSeriesDetails(this.dialogConfig.data.assetSeriesId).subscribe(assetSeriesDetails => {
        this.fieldSourcesCanBeDeleted = assetSeriesDetails.assetCount < 1;
      });
    }
  }

  private createAssetSeriesFormGroup(): void {
    this.assetSeriesForm = this.formBuilder.group({
      id: [],
      version: [],
      name: ['', WizardHelper.requiredTextValidator],
      description: ['', WizardHelper.maxTextLengthValidator],
      ceCertified: [null, Validators.required],
      protectionClass: [null, WizardHelper.maxTextLengthValidator],
      manualKey: [null, WizardHelper.maxTextLengthValidator],
      videoKey: [null, WizardHelper.maxTextLengthValidator],
      imageKey: [null, WizardHelper.maxTextLengthValidator],
      assetTypeTemplateId: [{ value: null, disabled: this.type === DialogType.EDIT }, Validators.required],
      companyId: [null, Validators.required],
    });

    if (this.assetSeries) {
      this.assetSeriesForm.patchValue(this.assetSeries);
    }
  }

  ngOnDestroy(): void {
    if (this.dynamicDialogRef) {
      if (this.type === DialogType.CREATE) {
        this.deleteUploadedImageIfNotDefault();
      }
      this.dynamicDialogRef.close();
    }
  }

  private deleteUploadedImageIfNotDefault() {
    if (this.assetSeriesImage) {
      const companyId = this.companyQuery.getActiveId();
      this.imageService.deleteImageIfNotDefault(companyId, this.assetSeriesForm.get('imageKey').value,
        this.initialAssetSeriesImageKey).subscribe();
    }
  }

  createAssetSeriesOfAssetTypeTemplate(assetTypeTemplateId: ID): void {
    this.assetSeriesService.initDraftFromAssetTypeTemplate(this.companyId, assetTypeTemplateId)
      .subscribe(assetSeries => this.initAssetSeries(assetSeries));
  }

  nextStep(): void {
    if (this.step === this.totalSteps) {
      this.saveAssetSeries();
    } else {
      this.step++;
    }
  }

  back(): void {
    if (this.step === AssetSeriesWizardStep.GENERAL_INFORMATION) {
      this.dynamicDialogRef.close();
    } else {
      this.step--;
    }
  }

  isReadyForNextStep(): boolean {
    let result = true;
    switch (this.step) {
      case AssetSeriesWizardStep.GENERAL_INFORMATION:
        result = this.assetSeries?.name?.length && this.assetSeries?.name?.length !== 0 &&
          this.assetSeriesForm.get('assetTypeTemplateId')?.value != null && this.assetSeriesForm.get('name').valid;
        break;
      case AssetSeriesWizardStep.NAMEPLATE_AND_CONNECTIVITY_SETTINGS:
        result = this.connectivitySettingsValid;
        break;
      case AssetSeriesWizardStep.METRICS:
        result = this.metricsValid;
        break;
      case AssetSeriesWizardStep.ATTRIBUTES:
        result = this.attributesValid;
        break;
    }
    return result;
  }

  setConnectivitySettingsValid(isValid: boolean): void {
    this.connectivitySettingsValid = isValid;
    this.changeDetectorRef.detectChanges();
  }

  setAttributesValid(isValid: boolean): void {
    this.attributesValid = isValid;
    this.changeDetectorRef.detectChanges();
  }

  setMetricsValid(isValid: boolean): void {
    this.metricsValid = isValid;
    this.changeDetectorRef.detectChanges();
  }

  private initAssetSeries(assetSeries: AssetSeries) {
    this.assetSeries = assetSeries;
    if (this.type === DialogType.CREATE) {
      this.assetSeries.imageKey = this.assetSeriesForm.get('imageKey').value ?? ImageService.DEFAULT_ASSET_AND_SERIES_IMAGE_KEY;
      this.initialAssetSeriesImageKey = this.assetSeries.imageKey;
    }
    this.createAssetSeriesFormGroup();
    this.updateRelatedObjects(assetSeries);
  }

  private updateRelatedObjects(assetSeries: AssetSeries): void {
    this.relatedManufacturer = this.companyQuery.getActive();
    if (!this.relatedManufacturer) {
      console.warn('[Asset wizard]: No active company found');
    }

    this.assetTypeTemplateQuery.selectLoading().subscribe(isLoading => {
      if (!isLoading) {
        const assetTypeTemplate = this.assetTypeTemplateQuery.getEntity(assetSeries.assetTypeTemplateId);
        this.relatedAssetType = this.assetTypeQuery.getEntity(assetTypeTemplate.assetTypeId);
      }
    });
  }

  private updateAssetSeriesFromForm(): void {
    const updatedAssetSeries: AssetSeries = this.assetSeriesForm.getRawValue();

    updatedAssetSeries.customScript = this.assetSeries.customScript;
    updatedAssetSeries.fieldSources = this.assetSeries.fieldSources;
    updatedAssetSeries.fieldSourceIds = this.assetSeries.fieldSourceIds;

    this.assetSeries = updatedAssetSeries;
  }

  private saveAssetSeries(): void {
    this.updateAssetSeriesFromForm();
    if (this.isAssetSeriesValid()) {
      if (this.type === DialogType.EDIT) {
        this.assetSeriesService.editItem(this.assetSeries.id, this.assetSeries)
          .subscribe(() => this.onEditingSuccess());
      } else if (this.type === DialogType.CREATE) {
        this.assetSeriesService.createItem(this.assetSeries.companyId, this.assetSeries)
          .subscribe(() => this.closeWizardAfterSave());
      }
    }
  }

  private isAssetSeriesValid(): boolean {
    if (this.assetSeries.imageKey == null) {
      console.warn('[asset series wizard]: No image key exists.');
      return false;
    }
    return true;
  }

  private onEditingSuccess(): void {
    this.editImageKeysOfAssetsOfAssetSerie();
    this.closeWizardAfterSave();
  }

  private editImageKeysOfAssetsOfAssetSerie(): void {
    this.assetQuery.selectAssetsOfAssetSerie(this.assetSeries.id)
      .pipe(take(1))
      .subscribe(assetsOfAssetSerie => {
      assetsOfAssetSerie.forEach(asset => {
        const isAssetImageKeyDefaultOfAssetSeries = asset.imageKey === this.initialAssetSeriesImageKey
          && asset.imageKey !== this.assetSeries.imageKey;

        if (isAssetImageKeyDefaultOfAssetSeries) {
          const changedAsset = { ...asset, imageKey: this.assetSeries.imageKey };
          this.assetService.editFleetAsset(this.assetSeries.id, changedAsset).subscribe();
        }
      });
    });
  }

  private closeWizardAfterSave() {
    this.dynamicDialogRef.close();
    this.dynamicDialogRef = null;
  }

  updateAssetSeriesImage(assetSeriesImage: string): void {
    if (assetSeriesImage) {
      this.assetSeriesImage = assetSeriesImage;
    }
  }
}
