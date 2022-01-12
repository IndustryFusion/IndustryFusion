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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Asset } from '../../../../core/store/asset/asset.model';
import { DialogType } from '../../../../shared/models/dialog-type.model';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AssetWizardStep } from './asset-wizard-step/asset-wizard-step.model';
import { AssetSeriesResolver } from '../../../../core/resolvers/asset-series.resolver';
import { AssetResolver } from '../../../../core/resolvers/asset.resolver';
import { ActivatedRoute } from '@angular/router';
import { ID } from '@datorama/akita';
import { AssetSeriesQuery } from '../../../../core/store/asset-series/asset-series.query';
import { AssetTypeTemplatesResolver } from '../../../../core/resolvers/asset-type-templates.resolver';
import { AssetTypesResolver } from '../../../../core/resolvers/asset-types.resolver';
import { AssetSeries } from '../../../../core/store/asset-series/asset-series.model';
import { Company } from '../../../../core/store/company/company.model';
import { AssetType } from '../../../../core/store/asset-type/asset-type.model';
import { CompanyQuery } from '../../../../core/store/company/company.query';
import { AssetTypeTemplateQuery } from '../../../../core/store/asset-type-template/asset-type-template.query';
import { AssetTypeQuery } from '../../../../core/store/asset-type/asset-type.query';
import { Observable } from 'rxjs';
import { AssetSeriesService } from '../../../../core/store/asset-series/asset-series.service';
import { AssetService } from '../../../../core/store/asset/asset.service';
import { FieldsResolver } from '../../../../core/resolvers/fields-resolver';
import { QuantityTypesResolver } from '../../../../core/resolvers/quantity-types.resolver';
import { CountryResolver } from '../../../../core/resolvers/country.resolver';
import { FleetAssetDetailsResolver } from '../../../../core/resolvers/fleet-asset-details.resolver';
import { MessageService } from 'primeng/api';
import { WizardHelper } from '../../../../core/helpers/wizard-helper';
import { ImageService } from '../../../../core/services/api/image.service';
import { FieldInstanceResolver } from '../../../../core/resolvers/field-instance.resolver';
import { RoomQuery } from '../../../../core/store/room/room.query';
import { FactorySiteQuery } from '../../../../core/store/factory-site/factory-site.query';

@Component({
  selector: 'app-asset-wizard',
  templateUrl: './asset-wizard.component.html',
  styleUrls: ['./asset-wizard.component.scss']
})
export class AssetWizardComponent implements OnInit, OnDestroy {

  public assetForm: FormGroup;
  public asset: Asset;
  public assetImageKeyBeforeEditing: string;
  public assetImage: string = null;
  public relatedAssetSeriesId: ID = null;
  public relatedAssetSeries: AssetSeries = null;
  public relatedCompany: Company = null;
  public relatedAssetType: AssetType = null;

  public type = DialogType.CREATE;
  public step = AssetWizardStep.GENERAL_INFORMATION;
  public isAssetSeriesLocked = false;

  public AssetWizardStep = AssetWizardStep;

  private companyId: ID;
  private metricsValid: boolean;
  private attributesValid: boolean;
  private subsystemsValid: boolean;
  private customerDataValid: boolean;
  private isAssetSeriesLoading$: Observable<boolean>;


  constructor(private assetSeriesResolver: AssetSeriesResolver,
              private changeDetectorRef: ChangeDetectorRef,
              private assetSeriesQuery: AssetSeriesQuery,
              private assetSeriesService: AssetSeriesService,
              private assetResolver: AssetResolver,
              private fleetAssetDetailsResolver: FleetAssetDetailsResolver,
              private assetService: AssetService,
              private companyQuery: CompanyQuery,
              private roomQuery: RoomQuery,
              private factorySiteQuery: FactorySiteQuery,
              private quantityTypesResolver: QuantityTypesResolver,
              private assetTypeTemplatesResolver: AssetTypeTemplatesResolver,
              private assetTypeTemplateQuery: AssetTypeTemplateQuery,
              private assetTypesResolver: AssetTypesResolver,
              private fieldInstanceResolver: FieldInstanceResolver,
              private fieldsResolver: FieldsResolver,
              private assetTypeQuery: AssetTypeQuery,
              private countryResolver: CountryResolver,
              private activatedRoute: ActivatedRoute,
              private formBuilder: FormBuilder,
              private config: DynamicDialogConfig,
              private ref: DynamicDialogRef,
              private imageService: ImageService,
              private messageService: MessageService) {
    this.resolveWizard();
  }

  private resolveWizard(): void {
    this.assetSeriesResolver.resolve().subscribe();
    this.assetResolver.resolve(this.activatedRoute.snapshot);
    this.fleetAssetDetailsResolver.resolveFromComponent().subscribe();
    this.assetTypesResolver.resolve().subscribe();
    this.fieldsResolver.resolve().subscribe();
    this.assetTypeTemplatesResolver.resolve().subscribe();
    this.quantityTypesResolver.resolve().subscribe();
    this.countryResolver.resolve().subscribe();
    this.isAssetSeriesLoading$ = this.assetSeriesQuery.selectLoading();
  }

  ngOnInit(): void {
    this.initFromConfig();

    this.createAssetForm();
    this.isAssetSeriesLoading$.subscribe(isLoading => {
      if (!isLoading) {
        this.initialUpdateOfAssetAndRelations();
      }
    });

    if (this.config.data.step) {
      this.onStepChange(this.config.data.step);
    }
  }

  private initFromConfig() {
    this.companyId = this.companyQuery.getActiveId();

    this.asset = this.config.data.asset ? { ...this.config.data.asset } : null;
    this.relatedAssetSeriesId = this.config.data.prefilledAssetSeriesId;

    this.type = this.asset ? DialogType.EDIT : DialogType.CREATE;
    this.isAssetSeriesLocked = this.relatedAssetSeriesId != null || this.type === DialogType.EDIT;

    this.assetImageKeyBeforeEditing = this.type === DialogType.CREATE ? ImageService.DEFAULT_ASSET_IMAGE_KEY : this.asset.imageKey;
  }

  private createAssetForm() {
    const assetSeriesIdOrNull = this.relatedAssetSeriesId;

    this.assetForm = this.formBuilder.group({
      id: [],
      version: [],
      name: ['', WizardHelper.requiredTextValidator],
      description: ['', WizardHelper.maxTextLengthValidator],
      companyId: [this.companyId, Validators.required],
      assetSeriesId: [assetSeriesIdOrNull, Validators.required],
      roomId: [],
      externalName: [null, WizardHelper.maxTextLengthValidator],
      controlSystemType: [null, WizardHelper.maxTextLengthValidator],
      hasGateway: [],
      gatewayConnectivity: [null, WizardHelper.maxTextLengthValidator],
      guid: [],
      ceCertified: [null, Validators.required],
      serialNumber: [null, WizardHelper.maxTextLengthValidator],
      constructionDate: [null, Validators.required],
      installationDate: [null],
      protectionClass: [null, WizardHelper.maxTextLengthValidator],
      handbookUrl: [null, WizardHelper.maxTextLengthValidator],
      videoUrl: [null, WizardHelper.maxTextLengthValidator],
      imageKey: [ImageService.DEFAULT_ASSET_IMAGE_KEY, WizardHelper.maxTextLengthValidator],
      connectionString: [null, WizardHelper.requiredTextValidator],
    });

    if (this.asset) {
      this.assetForm.patchValue(this.asset);
      const useConstructionDate = this.type === DialogType.EDIT && this.asset.constructionDate;
      const useInstallationDate = this.type === DialogType.EDIT && this.asset.installationDate;
      this.assetForm.get('constructionDate').setValue(useConstructionDate ? new Date(this.asset.constructionDate) : null);
      this.assetForm.get('installationDate').setValue(useInstallationDate ? new Date(this.asset.installationDate) : null);
    }
  }

  private initialUpdateOfAssetAndRelations() {
    if (this.isAssetSeriesLocked) {
      if (this.type === DialogType.CREATE) {
        this.initFromAssetSeries(this.relatedAssetSeriesId);
      }
      else if (this.type === DialogType.EDIT) {
        if (!this.asset.room && this.asset.roomId) {
          const room = this.roomQuery.getEntity(this.asset.roomId);
          this.asset.room = { ...room, factorySite: this.factorySiteQuery.getEntity(room.factorySiteId) };
        }
        this.resolveFieldInstancesOfAsset();
        this.updateRelatedObjects(this.assetSeriesQuery.getEntity(this.asset.assetSeriesId));
        this.loadAssetImage();
      }
    }
  }

  private resolveFieldInstancesOfAsset() {
    this.fieldInstanceResolver.resolveFromComponentOfAsset(this.asset).subscribe(fieldInstances => {
      this.asset.fieldInstances = fieldInstances.filter(fieldInstance => this.asset.fieldInstanceIds.includes(fieldInstance.id));
      this.asset.fieldInstanceIds = [];
    });
  }

  private loadAssetImage() {
    if (this.asset) {
      this.imageService.getImageAsUriSchemeString(this.companyId, this.asset.imageKey).subscribe(imageText => {
        this.assetImage = imageText;
      });
    }
  }

  private initFromAssetSeries(assetSeriesId: ID) {
    this.prefillFormFromAssetSeries(assetSeriesId);
    this.loadAssetImageFromAssetSeries();
  }

  private prefillFormFromAssetSeries(assetSeriesId: ID): void {
    const assetSeries = this.assetSeriesQuery.getEntity(assetSeriesId);
    if (assetSeries) {
      this.updateRelatedObjects(assetSeries);
      this.assetForm.get('name')?.setValue(assetSeries.name);
      this.assetForm.get('description')?.setValue(assetSeries.description);
      this.assetForm.get('ceCertified')?.setValue(assetSeries.ceCertified);
      this.assetForm.get('protectionClass')?.setValue(assetSeries.protectionClass);
      this.assetForm.get('handbookUrl')?.setValue(assetSeries.handbookUrl);
      this.assetForm.get('imageKey')?.setValue(assetSeries.imageKey);
      this.assetForm.get('videoUrl')?.setValue(assetSeries.videoUrl);
      this.assetForm.get('connectionString')?.setValue(assetSeries.connectivitySettings.connectionString);
    } else {
      console.warn('[Asset wizard]: Related asset series not found', assetSeriesId);
    }
  }

  private updateRelatedObjects(assetSeries: AssetSeries): void {
    this.relatedAssetSeriesId = assetSeries.id;
    this.relatedAssetSeries = assetSeries;
    this.relatedCompany = this.companyQuery.getActive();
    if (!this.relatedCompany) {
      console.warn('[Asset wizard]: No active company found');
    }

    this.assetTypeTemplateQuery.selectLoading().subscribe(isLoading => {
      if (!isLoading) {
        const assetTypeTemplate = this.assetTypeTemplateQuery.getEntity(assetSeries.assetTypeTemplateId);
        this.relatedAssetType = this.assetTypeQuery.getEntity(assetTypeTemplate.assetTypeId);
      }
    });
  }

  private loadAssetImageFromAssetSeries() {
    this.imageService.getImageAsUriSchemeString(this.companyId, this.relatedAssetSeries.imageKey).subscribe(imageText => {
      this.assetImage = imageText;
    });
  }

  onStepChange(step: number) {
    if (this.step === AssetWizardStep.GENERAL_INFORMATION && this.type === DialogType.CREATE) {
      this.initAssetDraftAndUpdateForm(step);
    } else {
      this.step = step;
    }
  }

  private initAssetDraftAndUpdateForm(step: number) {
    this.assetSeriesService.initAssetDraft(this.relatedCompany.id, this.relatedAssetSeriesId).subscribe(
      asset => {
        this.asset = asset;
        this.asset.name = this.assetForm.get('name').value;
        this.asset.description = this.assetForm.get('description').value;
        this.asset.imageKey = this.assetForm.get('imageKey').value;
        this.createAssetForm();
        this.step = step;
      }
    );
  }

  onChangeAssetSeries(assetSeriesId: ID): void {
    if (!this.isAssetSeriesLocked) {
      this.initFromAssetSeries(assetSeriesId);
    }
  }

  onSaveAsset(): void {
    if (this.asset && this.assetForm.valid && this.asset.fieldInstances
        && this.metricsValid && this.attributesValid && this.subsystemsValid && this.customerDataValid) {

      const asset = this.assetForm.getRawValue() as Asset;

      asset.subsystemIds = this.asset.subsystemIds;
      asset.fieldInstances = this.asset.fieldInstances;
      asset.room = this.asset.room;
      asset.roomId = this.asset.roomId;

      this.asset = asset;

      if (this.type === DialogType.EDIT) {
        this.assetService.editFleetAsset(this.relatedAssetSeriesId, this.asset).subscribe();
      } else if (this.type === DialogType.CREATE) {
        this.assetService.createAsset(this.relatedCompany.id, this.relatedAssetSeriesId, this.asset).subscribe();
      }

      this.ref.close(this.asset);
      this.ref = null;

    } else {
      this.messageService.add(({ severity: 'info', summary: 'Error', detail: 'Error at saving asset', sticky: true }));
      console.error('[Asset Wizard]: Error at saving asset');
    }
  }

  setMetricsValid(isValid: boolean) {
    this.metricsValid = isValid;
    this.changeDetectorRef.detectChanges();
  }

  setAttributesValid(isValid: boolean) {
    this.attributesValid = isValid;
    this.changeDetectorRef.detectChanges();
  }

  setCustomerDataValid(isValid: boolean) {
    this.customerDataValid = isValid;
  }

  setSubsystemValid(isValid: boolean) {
    this.subsystemsValid = isValid;
  }

  updateAssetImage(assetImage: string) {
    if (assetImage) {
      this.assetImage = assetImage;
    }
  }

  ngOnDestroy(): void {
    if (this.ref) {
      this.deleteUploadedImageIfNotDefault();
      this.ref.close();
    }
  }

  private deleteUploadedImageIfNotDefault() {
    if (this.assetImage) {
      this.imageService.deleteImageIfNotDefaultNorParent(this.companyId, this.assetForm.get('imageKey').value,
        this.assetImageKeyBeforeEditing, this.relatedAssetSeries.imageKey).subscribe();
    }
  }
}
