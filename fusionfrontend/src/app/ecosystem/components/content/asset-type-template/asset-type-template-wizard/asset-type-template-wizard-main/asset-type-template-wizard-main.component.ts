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

import { FieldTarget, FieldType } from '../../../../../../store/field-target/field-target.model';
import {
  AssetTypeTemplate,
  PublicationState
} from '../../../../../../store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateService } from '../../../../../../store/asset-type-template/asset-type-template.service';
import { FieldTargetService } from '../../../../../../store/field-target/field-target.service';
import { AssetTypesResolver } from '../../../../../../resolvers/asset-types.resolver';
import { FieldsResolver } from '../../../../../../resolvers/fields-resolver';
import { UnitsResolver } from '../../../../../../resolvers/units.resolver';
import { QuantityTypesResolver } from '../../../../../../resolvers/quantity-types.resolver';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AssetTypeTemplateComposedQuery } from '../../../../../../store/composed/asset-type-template-composed.query';
import { AssetTypeTemplateWizardSteps } from '../asset-type-template-wizard-steps.model';
import { ID } from '@datorama/akita';

import { take } from 'rxjs/operators';
import { DialogType } from '../../../../../../common/models/dialog-type.model';
import { WizardHelper } from '../../../../../../common/utils/wizard-helper';

@Component({
  selector: 'app-asset-type-template-wizard-main',
  templateUrl: './asset-type-template-wizard-main.component.html',
  styleUrls: ['./asset-type-template-wizard-main.component.scss']
})
export class AssetTypeTemplateWizardMainComponent implements OnInit {

  public assetTypeTemplateForm: FormGroup;
  public step: AssetTypeTemplateWizardSteps = AssetTypeTemplateWizardSteps.START;
  public assetTypeTemplate: AssetTypeTemplate;
  public fieldTargetsUnedited: FieldTarget[];
  public isAssetTypeLocked = false;
  public type = DialogType.CREATE;

  constructor(private assetTypeTemplateService: AssetTypeTemplateService,
              private assetTypeTemplateComposedQuery: AssetTypeTemplateComposedQuery,
              private fieldTargetService: FieldTargetService,
              private assetTypesResolver: AssetTypesResolver,
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
      assetTypeTemplateId: [],
      fieldTarget: [],
      imageKey: [],
    });
    assetTypeTemplateForm.patchValue(assetTypeTemplate);

    return assetTypeTemplateForm;
  }

  ngOnInit() {
    this.assetTypesResolver.resolve().subscribe();
    this.fieldsResolver.resolve().subscribe();
    this.unitsResolver.resolve().subscribe();
    this.quantityTypesResolver.resolve().subscribe();

    this.assetTypeTemplateForm = AssetTypeTemplateWizardMainComponent.createAssetTypeTemplateForm(this.formBuilder,
        this.config.data.assetTypeTemplate,
        this.config.data.preselectedAssetTypeId);
    this.isAssetTypeLocked = this.config.data.preselectedAssetTypeId != null;

    this.assetTypeTemplate = new AssetTypeTemplate();
    this.assetTypeTemplate.fieldTargets = [];

    if (this.config.data.type === DialogType.EDIT) {
      if (this.assetTypeTemplateForm.get('publicationState')?.value === PublicationState.PUBLISHED) {
        this.ref.close();
        return;
      }

      this.type = DialogType.EDIT;
      this.step = AssetTypeTemplateWizardSteps.OVERVIEW;
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

  // noinspection JSMethodCanBeStatic
  private replaceEmptyCustomNameWithName(fieldTargets: FieldTarget[]): FieldTarget[] {
    return fieldTargets.map(fieldTarget => {
      if (fieldTarget.name == null || fieldTarget.name.length < 1) {
        fieldTarget.name = fieldTarget.field?.name;
      }
      return fieldTarget;
    });
  }

  onChangeUseOfTemplate(assetTypeTemplateId: number) {
    if (assetTypeTemplateId) {
      this.fieldTargetService.getItemsByAssetTypeTemplate(assetTypeTemplateId)
        .pipe(take(1))
        .subscribe(() =>
        this.assetTypeTemplateComposedQuery.selectAssetTypeTemplate(assetTypeTemplateId)
          .pipe(take(1))
          .subscribe(x =>
          {
            this.assetTypeTemplate.fieldTargets = x.fieldTargets;

            if (this.type === DialogType.EDIT) {
              this.fieldTargetsUnedited = [...this.assetTypeTemplate.fieldTargets];
            }
          }
        )
      );
    } else {
      this.assetTypeTemplate.fieldTargets = [];
      this.assetTypeTemplate.fieldTargetIds = [];
    }
  }

  onSaveTemplate() {
    const assetTypeId = this.assetTypeTemplateForm.get('assetTypeId')?.value;

    if (assetTypeId && this.assetTypeTemplate.fieldTargets) {
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
    if (this.assetTypeTemplateForm.get('wasPublished')?.value) {
      this.assetTypeTemplateService.editItem(this.assetTypeTemplate.id, this.assetTypeTemplate).subscribe();
    }

    this.addNewFieldTargets();
    this.updateFieldTargets();
    this.deleteRemovedFieldTargets();
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
}
