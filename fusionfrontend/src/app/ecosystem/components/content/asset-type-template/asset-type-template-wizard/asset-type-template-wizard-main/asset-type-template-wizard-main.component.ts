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
import { FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AssetTypeTemplateComposedQuery } from '../../../../../../store/composed/asset-type-template-composed.query';
import { AssetTypeTemplateWizardSteps } from '../asset-type-template-wizard-steps.model';
import { ID } from '@datorama/akita';
import { BehaviorSubject } from 'rxjs';

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

  private changes: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private assetTypeTemplateService: AssetTypeTemplateService,
              private assetTypeTemplateComposedQuery: AssetTypeTemplateComposedQuery,
              private fieldTargetService: FieldTargetService,
              private assetTypesResolver: AssetTypesResolver,
              private fieldsResolver: FieldsResolver,
              private unitsResolver: UnitsResolver,
              private quantityTypesResolver: QuantityTypesResolver,
              private ref: DynamicDialogRef,
              private config: DynamicDialogConfig) { }

  ngOnInit() {
    this.assetTypesResolver.resolve().subscribe();
    this.fieldsResolver.resolve().subscribe();
    this.unitsResolver.resolve().subscribe();
    this.quantityTypesResolver.resolve().subscribe();

    this.assetTypeTemplateForm = this.config.data.assetTypeTemplateForm;

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
      this.fieldTargetService.getItems(assetTypeTemplateId).subscribe(() =>
        this.assetTypeTemplateComposedQuery.selectAssetTypeTemplate(assetTypeTemplateId).subscribe(x =>
          {
            this.assetTypeTemplate.fieldTargets = x.fieldTargets;

            // TODO: Should only be fired once...
            if (this.isEditing) {
              this.fieldTargetsUnedited = [...this.assetTypeTemplate.fieldTargets];
              console.log('copy old', this.assetTypeTemplate.fieldTargets);
              console.log('Unedited', this.fieldTargetsUnedited);
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
      this.assetTypeTemplate.imageKey = null;
      this.assetTypeTemplate.draftVersion = this.assetTypeTemplateForm.get('draftVersion')?.value;
      this.assetTypeTemplate.assetTypeId = assetTypeId;

      if (this.isEditing) {
        this.assetTypeTemplate.id = this.assetTypeTemplateForm.get('id')?.value;
        this.updateTemplate();
      } else {
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
    this.changes.subscribe(changes => {
      if (changes) {
        this.assetTypeTemplate.draftVersion++;
        this.assetTypeTemplateService.editItem(this.assetTypeTemplate.id, this.assetTypeTemplate).subscribe();
      }
    });
    this.addNewFieldTargets();
    this.updateFieldTargets();
    this.deleteRemovedFieldTargets();
  }

  private addNewFieldTargets() {
    console.log('add', this.assetTypeTemplate.fieldTargets);
    this.assetTypeTemplate.fieldTargets.forEach((fieldTarget) => {
      if (this.fieldTargetsUnedited.find(target => fieldTarget.id === target.id) == null) {
        console.log(fieldTarget.id);
        this.fieldTargetService.createItem(this.assetTypeTemplate.id, fieldTarget).subscribe();
        if (!this.changes.getValue()) {
          this.changes.next(true);
        }
      }
    });
  }

  private updateFieldTargets() {
    console.log('update', this.assetTypeTemplate.fieldTargets);
    this.assetTypeTemplate.fieldTargets.forEach((fieldTarget) => {
      // Update all existing as version will only be incremented if changes occured
      if (this.fieldTargetsUnedited.find(target => fieldTarget.id === target.id) != null) {
        const oldVersion = fieldTarget.version;
        this.fieldTargetService.editItem(this.assetTypeTemplate.id, fieldTarget)
          .subscribe(newFieldTarget =>
          {
            if (newFieldTarget.version !== oldVersion && !this.changes.getValue()) {
              this.changes.next(true);
            }
          }
        );
      }
    });
  }

  private deleteRemovedFieldTargets() {
    console.log('delete', this.fieldTargetsUnedited);
    this.fieldTargetsUnedited.forEach((fieldTarget) => {
      if (this.assetTypeTemplate.fieldTargets.find(target => fieldTarget.id === target.id) == null) {
        console.log(fieldTarget);
        // TODO: delete not working when references in field_source
        this.fieldTargetService.deleteItem(this.assetTypeTemplate.id, fieldTarget.id).subscribe();
        if (!this.changes.getValue()) {
          this.changes.next(true);
        }
      }
    });
  }
}
