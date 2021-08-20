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

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ID } from '@datorama/akita';

import { AssetSeriesService } from '../../../../store/asset-series/asset-series.service';
import { AssetSeries } from '../../../../store/asset-series/asset-series.model';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogType } from '../../../../common/models/dialog-type.model';
import { AssetSeriesWizardStep } from './asset-series-wizard-step.model';
import { ConnectivityTypeResolver } from '../../../../resolvers/connectivity-type.resolver';
import { Company } from '../../../../store/company/company.model';
import { AssetType } from '../../../../store/asset-type/asset-type.model';
import { CompanyQuery } from '../../../../store/company/company.query';
import { AssetTypeTemplateQuery } from '../../../../store/asset-type-template/asset-type-template.query';
import { AssetTypeQuery } from '../../../../store/asset-type/asset-type.query';
import { AssetTypesResolver } from '../../../../resolvers/asset-types.resolver';
import { FieldsResolver } from '../../../../resolvers/fields-resolver';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-asset-series-wizard',
  templateUrl: './asset-series-wizard.component.html',
  styleUrls: ['./asset-series-wizard.component.scss']
})
export class AssetSeriesWizardComponent implements OnInit {

  assetType: ID;
  companyId: ID;
  step: AssetSeriesWizardStep = AssetSeriesWizardStep.GENERAL_INFORMATION;
  totalSteps: number = AssetSeriesWizardStep.METRICS;

  assetSeries: AssetSeries;
  assetSeriesForm: FormGroup;

  mode: DialogType = DialogType.CREATE;
  connectivitySettingsValid: boolean;
  attributesValid: boolean;
  metricsValid: boolean;
  relatedManufacturer: Company;
  relatedAssetType: AssetType;

  AssetSeriesCreateSteps = AssetSeriesWizardStep;

  constructor(private assetSeriesService: AssetSeriesService,
              private companyQuery: CompanyQuery,
              private assetTypeTemplateQuery: AssetTypeTemplateQuery,
              private assetTypeQuery: AssetTypeQuery,
              private assetTypesResolver: AssetTypesResolver,
              private changeDetectorRef: ChangeDetectorRef,
              private fieldsResolver: FieldsResolver,
              private formBuilder: FormBuilder,
              private connectivityTypeResolver: ConnectivityTypeResolver,
              private dialogConfig: DynamicDialogConfig,
              private dynamicDialogRef: DynamicDialogRef,
  ) {
    this.resolve();
    this.initFromConfigData(dialogConfig);
  }

  ngOnInit() {
    this.createAssetSeriesFormGroup();
  }

  private resolve() {
    this.fieldsResolver.resolve().subscribe();
    this.connectivityTypeResolver.resolve().subscribe();
    this.assetTypesResolver.resolve().subscribe();
  }

  private initFromConfigData(dialogConfig: DynamicDialogConfig): void {
    this.companyId = dialogConfig.data.companyId;

    const assetSeriesId = this.dialogConfig.data.assetSeriesId;
    this.mode = assetSeriesId ? DialogType.EDIT : DialogType.CREATE;

    if (this.mode === DialogType.EDIT) {
      this.assetSeriesService.getAssetSeries(this.companyId, assetSeriesId)
        .subscribe( assetSeries => this.updateAssetSeries(assetSeries));
    }
  }

  ngOnInit() {
    this.createAssetSeriesFormGroup();
  }

  private createAssetSeriesFormGroup(): void {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];

    this.assetSeriesForm = this.formBuilder.group({
      id: [],
      name: ['', requiredTextValidator],
      description: ['', Validators.maxLength(255)],
      ceCertified: [null, Validators.required],
      protectionClass: [null, Validators.maxLength(255)],
      handbookKey: [null, Validators.maxLength(255)],
      videoKey: [null, Validators.maxLength(255)],
      imageKey: [null, Validators.maxLength(255)],
      assetTypeTemplateId: [{ value: null, disabled: this.mode === DialogType.EDIT }, Validators.required],
      companyId: [null, Validators.required],
    });

    if (this.assetSeries) {
      this.assetSeriesForm.patchValue(this.assetSeries);
    }
  }


  private updateAssetSeries(assetSeries: AssetSeries) {
    this.assetSeries = assetSeries;
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

  createAssetSeriesOfAssetTypeTemplate(assetTypeTemplateId: ID): void {
    this.assetSeriesService.initDraftFromAssetTypeTemplate(this.companyId, assetTypeTemplateId)
          .subscribe( assetSeries => this.updateAssetSeries(assetSeries));
  }

  private createAssetSeriesFormGroup(): void {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];

    this.assetSeriesForm = this.formBuilder.group({
      id: [],
      name: ['', requiredTextValidator],
      description: ['', Validators.maxLength(255)],
      ceCertified: [null, Validators.required],
      protectionClass: [null, Validators.maxLength(255)],
      handbookKey: [null, Validators.maxLength(255)],
      videoKey: [null, Validators.maxLength(255)],
      imageKey: [null, Validators.maxLength(255)],
      assetTypeTemplateId: [{ value: null, disabled: this.mode === DialogType.EDIT }, Validators.required],
      companyId: [null, Validators.required],
    });

    if (this.assetSeries) {
      this.assetSeriesForm.patchValue(this.assetSeries);
    }
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
                 this.assetSeriesForm.get('assetTypeTemplateId')?.value != null;
        break;
      case AssetSeriesWizardStep.CONNECTIVITY_SETTINGS:
        result = this.connectivitySettingsValid;
        break;
      case AssetSeriesWizardStep.ATTRIBUTES:
        result = this.attributesValid;
        break;
      case AssetSeriesWizardStep.METRICS:
        result = this.metricsValid;
        break;
    }
    return result;
  }

  private updateAssetSeriesFromForm(): void {
    const updatedAssetSeries: AssetSeries = this.assetSeriesForm.getRawValue();

    updatedAssetSeries.fieldSources = this.assetSeries.fieldSources;
    updatedAssetSeries.fieldSourceIds = this.assetSeries.fieldSourceIds;

    this.assetSeries = updatedAssetSeries;
  }

  private saveAssetSeries(): void {
    this.updateAssetSeriesFromForm();

    if (this.assetSeries.id) {
      this.assetSeriesService.editItem(this.assetSeries.id, this.assetSeries).subscribe(
      () => this.dynamicDialogRef.close()
      );
    } else {
      this.assetSeriesService.createItem(this.assetSeries.companyId, this.assetSeries)
        .subscribe(() => this.dynamicDialogRef.close());
    }
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
}
