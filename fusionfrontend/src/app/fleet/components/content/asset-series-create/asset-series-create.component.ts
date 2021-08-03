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
import { AssetSeriesCreateSteps } from './asset-series-create-steps.model';
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
  selector: 'app-asset-series-create',
  templateUrl: './asset-series-create.component.html',
  styleUrls: ['./asset-series-create.component.scss']
})
export class AssetSeriesCreateComponent implements OnInit {

  assetType: ID;
  companyId: ID;
  step: AssetSeriesCreateSteps = AssetSeriesCreateSteps.GENERAL_INFORMATION;
  totalSteps: number = AssetSeriesCreateSteps.METRICS;

  assetSeries: AssetSeries;
  assetSeriesForm: FormGroup;

  mode: DialogType = DialogType.CREATE;
  attributesValid: boolean;
  metricsValid: boolean;
  relatedManufacturer: Company;
  relatedAssetType: AssetType;

  AssetSeriesCreateSteps = AssetSeriesCreateSteps;

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

    this.companyId = dialogConfig.data.companyId;
    const assetSeriesId = this.dialogConfig.data.assetSeriesId;
    if (assetSeriesId) {
      this.mode = DialogType.EDIT;
    } else {
      this.mode = DialogType.CREATE;
    }

    if (this.mode === DialogType.EDIT) {
      this.assetSeriesService.getAssetSeries(this.companyId, assetSeriesId)
        .subscribe( assetSeries => this.updateAssetSeries(assetSeries));
    }
  }

  ngOnInit() {
    this.createAssetSeriesForm();
  }

  private resolve() {
    this.fieldsResolver.resolve().subscribe();
    this.connectivityTypeResolver.resolve().subscribe();
    this.assetTypesResolver.resolve().subscribe();
  }

  private updateAssetSeries(assetSeries: AssetSeries) {
    this.assetSeries = assetSeries;
    this.createAssetSeriesForm();
    this.updateRelatedObjects(assetSeries);
  }

  private updateRelatedObjects(assetSeries: AssetSeries): void {
    this.relatedManufacturer = this.companyQuery.getActive();
    if (!this.relatedManufacturer) {
      console.warn('[Asset wizard]: No active company found');
    }

    this.assetTypeTemplateQuery.selectLoading().subscribe(isLoading => {
      console.log('isLoading', isLoading);
      if (!isLoading) {
        const assetTypeTemplate = this.assetTypeTemplateQuery.getEntity(assetSeries.assetTypeTemplateId);
        this.relatedAssetType = this.assetTypeQuery.getEntity(assetTypeTemplate.assetTypeId);
      }
    });
  }

  createAssetSeriesOfAssetTypeTemplate(assetTypeTemplateId: ID) {
    this.assetSeriesService.initDraftFromAssetTypeTemplate(this.companyId, assetTypeTemplateId)
          .subscribe( assetSeries => this.updateAssetSeries(assetSeries));
  }

  private createAssetSeriesForm() {
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
      assetTypeTemplateId: [{ value: null, disabled: this.mode !== DialogType.CREATE }, Validators.required],
      companyId: [null, Validators.required],
      connectivityTypeId: [null, Validators.required],
      protocolId: [null, Validators.required],
      connectionString: [null, Validators.maxLength(255)],
    });

    if (this.assetSeries) {
      this.assetSeriesForm.patchValue(this.assetSeries);
    }

    this.assetSeriesForm.get('assetTypeTemplateId').valueChanges.subscribe(
      assetTypeTemplateId => this.updateAssetSeriesNameDisabledState(assetTypeTemplateId));
    this.updateAssetSeriesNameDisabledState(this.assetSeriesForm.get('assetTypeTemplateId').value);
  }

  private updateAssetSeriesNameDisabledState(assetTypeTemplateId: ID) {
    console.log('assetTypeTemplateId', assetTypeTemplateId);
    if (assetTypeTemplateId) {
      this.assetSeriesForm.get('name').enable();
    } else {
      this.assetSeriesForm.get('name').disable( { onlySelf: true });
    }
  }

  nextStep() {
    if (this.step === this.totalSteps) {
      this.saveAssetSeries();
    } else {
      this.step++;
    }
  }

  back() {
    if (this.step === AssetSeriesCreateSteps.GENERAL_INFORMATION) {
      this.dynamicDialogRef.close();
    } else {
      this.step--;
    }
  }

  isReadyForNextStep(): boolean {
    let result = true;
    switch (this.step) {
      case AssetSeriesCreateSteps.GENERAL_INFORMATION:
        result = this.assetSeries?.name?.length && this.assetSeries?.name?.length !== 0;
        break;
      case AssetSeriesCreateSteps.CONNECTIVITY_SETTINGS:
        break;
      case AssetSeriesCreateSteps.ATTRIBUTES:
        result = this.attributesValid;
        break;
      case AssetSeriesCreateSteps.METRICS:
        result = this.metricsValid;
        break;
    }
    return result;
  }

  private saveAssetSeries() {
      if (this.assetSeries.id) {
        this.assetSeriesService.editItem(this.assetSeries.id, this.assetSeries).subscribe(
        () => this.dynamicDialogRef.close()
        );
      } else {
        this.assetSeriesService.createItem(this.assetSeries.companyId, this.assetSeries)
          .subscribe(() => this.dynamicDialogRef.close());
      }
  }

  setAttributesValid(isValid: boolean) {
    this.attributesValid = isValid;
    this.changeDetectorRef.detectChanges();
  }

  setMetricsValid(isValid: boolean) {
    this.metricsValid = isValid;
    this.changeDetectorRef.detectChanges();
  }
}
