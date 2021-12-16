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

import { Component, OnInit } from '@angular/core';

import { FieldTarget, FieldType } from '../../../../../core/store/field-target/field-target.model';
import {
  AssetTypeTemplate,
  PublicationState
} from '../../../../../core/store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateService } from '../../../../../core/store/asset-type-template/asset-type-template.service';
import { FieldTargetService } from '../../../../../core/store/field-target/field-target.service';
import { AssetTypesResolver } from '../../../../../core/resolvers/asset-types.resolver';
import { FieldsResolver } from '../../../../../core/resolvers/fields-resolver';
import { UnitsResolver } from '../../../../../core/resolvers/units.resolver';
import { QuantityTypesResolver } from '../../../../../core/resolvers/quantity-types.resolver';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AssetTypeTemplateComposedQuery } from '../../../../../core/store/composed/asset-type-template-composed.query';
import { AssetTypeTemplateWizardSteps } from './asset-type-template-wizard-steps.model';
import { ID } from '@datorama/akita';

import { take } from 'rxjs/operators';
import { DialogType } from '../../../../../shared/models/dialog-type.model';
import { WizardHelper } from '../../../../../core/helpers/wizard-helper';
import { AssetTypeTemplatesResolver } from '../../../../../core/resolvers/asset-type-templates.resolver';
import { CustomFormValidators } from '../../../../../core/validators/custom-form-validators';

@Component({
  selector: 'app-asset-type-template-wizard',
  templateUrl: './asset-type-template-wizard.component.html',
  styleUrls: ['./asset-type-template-wizard.component.scss']
})
export class AssetTypeTemplateWizardComponent implements OnInit {

  public assetTypeTemplateForm: FormGroup;
  public step: AssetTypeTemplateWizardSteps = AssetTypeTemplateWizardSteps.START;
  public assetTypeTemplate: AssetTypeTemplate;
  public fieldTargetsUnedited: FieldTarget[];
  public isAssetTypeLocked = false;
  public type = DialogType.CREATE;

  private isSubsystemsValid = true;
  private isPeersValid = true;

  Steps = AssetTypeTemplateWizardSteps;

  constructor(private assetTypeTemplateService: AssetTypeTemplateService,
              private assetTypeTemplateComposedQuery: AssetTypeTemplateComposedQuery,
              private fieldTargetService: FieldTargetService,
              private assetTypesResolver: AssetTypesResolver,
              private assetTypeTemplatesResolver: AssetTypeTemplatesResolver,
              private fieldsResolver: FieldsResolver,
              private unitsResolver: UnitsResolver,
              private quantityTypesResolver: QuantityTypesResolver,
              private formBuilder: FormBuilder,
              private ref: DynamicDialogRef,
              private config: DynamicDialogConfig) { }

  public static createAssetTypeTemplateForm(formBuilder: FormBuilder,
                                            assetTypeTemplate: AssetTypeTemplate,
                                            prefilledAssetTypeIdOrNull: ID | null) {
    const assetTypeTemplateForm = formBuilder.group({
      id: [],
      version: [],
      name: ['', WizardHelper.requiredTextValidator],
      description: ['', WizardHelper.maxTextLengthValidator],
      publicationState: [PublicationState.DRAFT],
      publishedDate: [],
      publishedVersion: [],
      wasPublished: [false],
      useExistingTemplate: [false, Validators.required],
      assetTypeId: [prefilledAssetTypeIdOrNull, Validators.required],
      assetTypeTemplateId: [null, CustomFormValidators.requiredIfOtherIsTrue('useExistingTemplate')],
      fieldTarget: [],
      imageKey: [],
    });
    assetTypeTemplateForm.patchValue(assetTypeTemplate);

    assetTypeTemplateForm.get('useExistingTemplate').valueChanges
      .subscribe(() => AssetTypeTemplateWizardComponent.validateForm(assetTypeTemplateForm));
    AssetTypeTemplateWizardComponent.validateForm(assetTypeTemplateForm);

    return assetTypeTemplateForm;
  }

  private static validateForm(formGroup: FormGroup): void {
    if (formGroup != null) {
      const formKeysToValidate = ['useExistingTemplate', 'assetTypeTemplateId'];
      formKeysToValidate.forEach(controlsKey => {
        formGroup.get(controlsKey).updateValueAndValidity({ onlySelf: true, emitEvent: false });
        formGroup.get(controlsKey).markAsDirty();
      });
    }
  }

  ngOnInit() {
    this.resolve();
    this.initAssetTypeTemplateForm();
    this.initAssetTypeTemplate();
    this.initialHandlingOfEditMode();
  }

  private resolve(): void {
    this.assetTypesResolver.resolve().subscribe();
    this.fieldsResolver.resolve().subscribe();
    this.unitsResolver.resolve().subscribe();
    this.quantityTypesResolver.resolve().subscribe();
    this.assetTypeTemplatesResolver.resolve().subscribe();
  }

  private initAssetTypeTemplateForm(): void {
    this.assetTypeTemplateForm = AssetTypeTemplateWizardComponent.createAssetTypeTemplateForm(this.formBuilder,
      this.config.data.assetTypeTemplate,
      this.config.data.preselectedAssetTypeId);
    this.isAssetTypeLocked = this.config.data.preselectedAssetTypeId != null;
  }

  private initAssetTypeTemplate(): void {
    this.assetTypeTemplate = new AssetTypeTemplate();
    this.assetTypeTemplate.fieldTargets = [];
    this.assetTypeTemplate.subsystemIds = [];
    this.assetTypeTemplate.peers = [];
  }

  private initialHandlingOfEditMode(): void {
    if (this.config.data.type === DialogType.EDIT) {
      if (this.assetTypeTemplateForm.get('publicationState')?.value === PublicationState.PUBLISHED) {
        this.ref.close();
        return;
      }

      this.type = DialogType.EDIT;
      this.step = AssetTypeTemplateWizardSteps.REVIEW;
      this.onChangeUseOfTemplate(this.assetTypeTemplateForm.get('id')?.value);
    }
  }

  getMetrics(): FieldTarget[] {
    return this.assetTypeTemplate.fieldTargets?.filter((field) => field.fieldType === FieldType.METRIC);
  }

  getAttributes(): FieldTarget[] {
    return this.assetTypeTemplate.fieldTargets?.filter((field) => field.fieldType === FieldType.ATTRIBUTE);
  }

  onStepChange(step: number) {
    this.step = step;
  }

  onMetricsChanged(metrics: FieldTarget[]) {
    this.assetTypeTemplate.fieldTargets = this.getAttributes().concat(this.replaceEmptyCustomNameWithName(metrics));
  }

  onAttributesChanged(attributes: FieldTarget[]) {
    this.assetTypeTemplate.fieldTargets = this.getMetrics().concat(this.replaceEmptyCustomNameWithName(attributes));
  }

  setSubsystemValidity(isValid: boolean) {
    this.isSubsystemsValid = isValid;
  }

  setPeersValidity(isValid: boolean) {
    this.isPeersValid = isValid;
  }

  // noinspection JSMethodCanBeStatic
  private replaceEmptyCustomNameWithName(fieldTargets: FieldTarget[]): FieldTarget[] {
    return fieldTargets.map(fieldTarget => {
      if (fieldTarget.name == null || fieldTarget.name.length < 1) {
        fieldTarget.name = fieldTarget.field?.name;
      }
      return fieldTarget;
    });
  }

  onChangeUseOfTemplate(assetTypeTemplateId: ID) {
    if (assetTypeTemplateId) {
      this.prefillAssetTypeTemplate(assetTypeTemplateId);
    } else {
      this.assetTypeTemplate.fieldTargets = [];
      this.assetTypeTemplate.fieldTargetIds = [];
      this.assetTypeTemplate.subsystemIds = [];
      this.assetTypeTemplate.peers = [];
    }
  }

  private prefillAssetTypeTemplate(assetTypeTemplateId: ID) {
    this.fieldTargetService.getItemsByAssetTypeTemplate(assetTypeTemplateId)
      .pipe(take(1))
      .subscribe(() =>
        this.assetTypeTemplateComposedQuery.selectAssetTypeTemplate(assetTypeTemplateId)
          .pipe(take(1))
          .subscribe(assetTypeTemplate =>
            {
              this.assetTypeTemplate.fieldTargets = assetTypeTemplate.fieldTargets;
              this.assetTypeTemplate.subsystemIds = assetTypeTemplate.subsystemIds;
              this.assetTypeTemplate.peers = assetTypeTemplate.peers;

              if (this.type === DialogType.EDIT) {
                this.fieldTargetsUnedited = [...this.assetTypeTemplate.fieldTargets];
              }
            }
          )
      );
  }

  onSaveTemplate() {
    const assetTypeId = this.assetTypeTemplateForm.get('assetTypeId')?.value;

    if (assetTypeId && this.assetTypeTemplate.fieldTargets && this.isSubsystemsValid && this.isPeersValid) {
      this.assetTypeTemplate.name = this.assetTypeTemplateForm.get('name')?.value;
      this.assetTypeTemplate.description = this.assetTypeTemplateForm.get('description')?.value;
      this.assetTypeTemplate.publicationState = this.assetTypeTemplateForm.get('publicationState')?.value;
      this.assetTypeTemplate.publishedDate = this.assetTypeTemplateForm.get('publishedDate')?.value;
      this.assetTypeTemplate.publishedVersion = this.assetTypeTemplateForm.get('publishedVersion')?.value;
      this.assetTypeTemplate.imageKey = null;
      this.assetTypeTemplate.assetTypeId = assetTypeId;

      if (this.type === DialogType.EDIT) {
        this.assetTypeTemplate.id = this.assetTypeTemplateForm.get('id')?.value;
        this.assetTypeTemplate.version = this.assetTypeTemplateForm.get('version')?.value;
        this.updateTemplate();
      } else if (this.type === DialogType.CREATE)  {
        this.createTemplate(assetTypeId);
      }
    } else {
      console.warn('[ATT wizard]: data are invalid. Therefore, no saving...');
    }
  }

  private createTemplate(assetTypeId: ID) {
    this.assetTypeTemplateService.createTemplate(this.assetTypeTemplate, assetTypeId).subscribe(
      (template) => {
        this.assetTypeTemplate.fieldTargets.forEach((fieldTarget) => {
          this.fieldTargetService.createItem(template.id, fieldTarget).subscribe();
        });
      }
    );
  }

  private updateTemplate() {
    this.addNewFieldTargets();
    this.updateFieldTargets();
    this.deleteRemovedFieldTargets();

    this.updateTemplateWithPeers();
  }

  private addNewFieldTargets() {
    this.assetTypeTemplate.fieldTargets.forEach((fieldTarget) => {
      if (this.fieldTargetsUnedited.find(target => fieldTarget.id === target.id) == null) {
        this.fieldTargetService.createItem(this.assetTypeTemplate.id, fieldTarget).subscribe();
      }
    });
  }

  private updateFieldTargets() {
    this.assetTypeTemplate.fieldTargets.forEach((fieldTarget) => {

      // Update all existing as version will only be incremented if changes occurred
      if (this.fieldTargetsUnedited.find(target => fieldTarget.id === target.id) != null) {
        this.fieldTargetService.editItem(this.assetTypeTemplate.id, fieldTarget).subscribe();
      }
    });
  }

  private deleteRemovedFieldTargets() {
    this.fieldTargetsUnedited.forEach((fieldTarget) => {
      if (this.assetTypeTemplate.fieldTargets.find(target => fieldTarget.id === target.id) == null) {
        this.fieldTargetService.deleteItem(this.assetTypeTemplate.id, fieldTarget.id).subscribe();
      }
    });
  }

  private updateTemplateWithPeers() {
    this.assetTypeTemplateService.editItem(this.assetTypeTemplate.id, this.assetTypeTemplate).subscribe();
  }
}
