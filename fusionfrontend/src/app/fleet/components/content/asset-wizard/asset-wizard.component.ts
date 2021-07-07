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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Asset } from '../../../../store/asset/asset.model';
import { DialogType } from '../../../../common/models/dialog-type.model';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { AssetWizardStep } from './asset-wizard-step/asset-wizard-step.model';
import { AssetSeriesResolver } from '../../../../resolvers/asset-series.resolver';
import { AssetResolver } from '../../../../resolvers/asset.resolver';
import { ActivatedRoute } from '@angular/router';
import { ID } from '@datorama/akita';
import { AssetSeriesQuery } from '../../../../store/asset-series/asset-series.query';
import { AssetTypeTemplatesResolver } from '../../../../resolvers/asset-type-templates.resolver';
import { AssetTypesResolver } from '../../../../resolvers/asset-types.resolver';
import { AssetSeries } from '../../../../store/asset-series/asset-series.model';
import { Company } from '../../../../store/company/company.model';
import { AssetType } from '../../../../store/asset-type/asset-type.model';
import { CompanyQuery } from '../../../../store/company/company.query';
import { AssetTypeTemplateQuery } from '../../../../store/asset-type-template/asset-type-template.query';
import { AssetTypeQuery } from '../../../../store/asset-type/asset-type.query';
import { Observable } from 'rxjs';
import { AssetSeriesService } from '../../../../store/asset-series/asset-series.service';
import { AssetService } from '../../../../store/asset/asset.service';
import { FieldsResolver } from '../../../../resolvers/fields-resolver';

@Component({
  selector: 'app-asset-wizard',
  templateUrl: './asset-wizard.component.html',
  styleUrls: ['./asset-wizard.component.scss']
})
export class AssetWizardComponent implements OnInit {

  public isLoading$: Observable<boolean>;

  public assetForm: FormGroup;
  public asset: Asset;
  public relatedAssetSeries: AssetSeries = null;
  public relatedCompany: Company = null;
  public relatedAssetType: AssetType = null;
  public type = DialogType.CREATE;
  public step = AssetWizardStep.GENERAL_INFORMATION;
  public isAssetSeriesLocked = false;

  public metricsValid: boolean;

  public AssetWizardStep = AssetWizardStep;

  constructor(private assetSeriesResolver: AssetSeriesResolver,
              private changeDetectorRef: ChangeDetectorRef,
              private assetSeriesQuery: AssetSeriesQuery,
              private assetSeriesService: AssetSeriesService,
              private assetResolver: AssetResolver,
              private assetService: AssetService,
              private companyQuery: CompanyQuery,
              private assetTypeTemplatesResolver: AssetTypeTemplatesResolver,
              private assetTypeTemplateQuery: AssetTypeTemplateQuery,
              private assetTypesResolver: AssetTypesResolver,
              private fieldsResolver: FieldsResolver,
              private assetTypeQuery: AssetTypeQuery,
              private activatedRoute: ActivatedRoute,
              private formBuilder: FormBuilder,
              private config: DynamicDialogConfig) { }

  ngOnInit(): void {
    this.resolveWizard();

    this.asset = { ...this.config.data.asset };
    this.createAssetForm();

    this.isAssetSeriesLocked = this.config.data.prefilledAssetSeriesId != null;
    if (this.isAssetSeriesLocked) {
      this.assetForm.get('assetSeriesId')?.disable();
      this.isLoading$.subscribe(() => {
        this.prefillFormFromAssetSeries(this.config.data.prefilledAssetSeriesId);
      });
    }

    if (this.config.data.step) {
      this.onStepChange(this.config.data.step);
    }
  }

  onStepChange(step: number) {
    if (this.step === AssetWizardStep.GENERAL_INFORMATION) {
      this.assetSeriesService.initAssetDraft(this.relatedCompany.id, this.relatedAssetSeries.id).subscribe(
        asset => {
          this.asset = asset;
          this.step = step;
        }
      );
    } else {
      this.step = step;
    }
  }

  onChangeAssetSeries(assetSeriesId: ID): void {
    if (!this.isAssetSeriesLocked) {
      this.prefillFormFromAssetSeries(assetSeriesId);
    }
  }

  private prefillFormFromAssetSeries(assetSeriesId: ID): void {
    const assetSeries = this.assetSeriesQuery.getEntity(assetSeriesId);
    if (assetSeries) {
      this.updateRelatedObjects(assetSeries);
      this.assetForm.get('name')?.setValue(assetSeries.name);
      this.assetForm.get('description')?.setValue(assetSeries.description);
      this.assetForm.get('ceCertified')?.setValue(assetSeries.ceCertified);
      this.assetForm.get('protectionClass')?.setValue(assetSeries.protectionClass);
      this.assetForm.get('handbookKey')?.setValue(assetSeries.handbookKey);
      this.assetForm.get('videoKey')?.setValue(assetSeries.videoKey);
    }
  }

  private updateRelatedObjects(assetSeries: AssetSeries): void {
    this.relatedAssetSeries = assetSeries;
    this.relatedCompany = this.companyQuery.getActive();
    const assetTypeTemplate = this.assetTypeTemplateQuery.getEntity(assetSeries.assetTypeTemplateId);
    this.relatedAssetType = this.assetTypeQuery.getEntity(assetTypeTemplate.assetTypeId);
  }

  private resolveWizard(): void {
    this.assetSeriesResolver.resolve(this.activatedRoute.snapshot);
    this.assetResolver.resolve(this.activatedRoute.snapshot);
    this.assetTypesResolver.resolve().subscribe();
    this.fieldsResolver.resolve().subscribe();
    this.isLoading$ = this.assetSeriesQuery.selectLoading(); // TODO: is this correct?
    this.assetTypeTemplatesResolver.resolve().subscribe();
  }

  private createAssetForm() {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    const companyId = this.config.data.companyId;
    const assetSeriesIdOrNull = this.config.data.prefilledAssetSeriesId;

    this.assetForm = this.formBuilder.group({
      id: [],
      name: ['', requiredTextValidator],
      description: ['', Validators.maxLength(255)],
      companyId: [companyId, Validators.required],
      assetSeriesId: [assetSeriesIdOrNull, Validators.required],
      roomId: [],
      externalId: [null, Validators.maxLength(255)],
      controlSystemType: [null, Validators.maxLength(255)],
      hasGateway: [],
      gatewayConnectivity: [null, Validators.maxLength(255)],
      guid: [],
      ceCertified: [null, Validators.required],
      serialNumber: [null, requiredTextValidator],
      constructionDate: [null, Validators.required],
      installationDate: [null, Validators.required],
      protectionClass: [null, Validators.maxLength(255)],
      handbookKey: [null, Validators.maxLength(255)],
      videoKey: [null, Validators.maxLength(255)],
      imageKey: [null, Validators.maxLength(255)],
    });

    if (this.asset) {
      this.assetForm.patchValue(this.asset);
    }
  }

  setMetricsValid(isValid: boolean) {
    this.metricsValid = isValid;
    this.changeDetectorRef.detectChanges();
  }
}
