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
import { AssetTypeTemplate } from '../../../../../../store/asset-type-template/asset-type-template.model';
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
  public isEditing = false;

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

  ngOnInit() {
    this.assetTypesResolver.resolve().subscribe();
    this.fieldsResolver.resolve().subscribe();
    this.unitsResolver.resolve().subscribe();
    this.quantityTypesResolver.resolve().subscribe();

    this.createAssetTypeTemplateForm(this.formBuilder, this.config.data.assetTypeTemplate);

    this.assetTypeTemplate = new AssetTypeTemplate();
    this.assetTypeTemplate.fieldTargets = [];

    if (this.config.data.isEditing) {
      if (this.assetTypeTemplateForm.get('published')?.value === true) {
        this.ref.close();
        return;
      }

      this.isEditing = true;
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

  onMetricsSelect(metrics: FieldTarget[]) {
    this.assetTypeTemplate.fieldTargets =  this.getAttributes().concat(metrics);
  }

  onAttributesSelect(attributes: FieldTarget[]) {
    this.assetTypeTemplate.fieldTargets =  this.getMetrics().concat(attributes);
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

            if (this.isEditing) {
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
      this.assetTypeTemplate.published = this.assetTypeTemplateForm.get('published')?.value;
      this.assetTypeTemplate.publishedDate = this.assetTypeTemplateForm.get('publishedDate')?.value;
      this.assetTypeTemplate.imageKey = null;
      this.assetTypeTemplate.publishedVersion = this.assetTypeTemplateForm.get('publishedVersion')?.value;
      this.assetTypeTemplate.assetTypeId = assetTypeId;

      if (this.isEditing) {
        this.assetTypeTemplate.id = this.assetTypeTemplateForm.get('id')?.value;
        this.updateTemplate();
      } else {
        this.createTemplate(assetTypeId);
      }
    }
  }

  private createAssetTypeTemplateForm(formBuilder: FormBuilder, assetTypeTemplate: AssetTypeTemplate) {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    this.assetTypeTemplateForm = formBuilder.group({
      id: [],
      name: ['', requiredTextValidator],
      description: ['', Validators.maxLength(255)],
      published: [false],
      publishedDate: [],
      wasPublished: [false],
      useExistingTemplate: [false, Validators.required],
      assetTypeId: [null, Validators.required],
      assetTypeTemplateId: [],
      fieldTarget: [],
      publishedVersion: []
    });
    this.assetTypeTemplateForm.patchValue(assetTypeTemplate);
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
