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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder } from '@angular/forms';
import { ID } from '@datorama/akita';
import { AssetTypeTemplate } from '../../../../../../../core/store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateQuery } from '../../../../../../../core/store/asset-type-template/asset-type-template.query';
import { WizardHelper } from '../../../../../../../core/helpers/wizard-helper';
import { AssetTypeQuery } from '../../../../../../../core/store/asset-type/asset-type.query';
import { AssetTypeTemplateWizardStepStartComponent } from '../../asset-type-template-wizard-step/asset-type-template-wizard-step-start/asset-type-template-wizard-step-start.component';

@Component({
  selector: 'app-asset-type-template-wizard-shared-relationships',
  templateUrl: './asset-type-template-wizard-shared-relationships.component.html',
  styleUrls: ['./asset-type-template-wizard-shared-relationships.component.scss']
})
export class AssetTypeTemplateWizardSharedRelationshipsComponent implements OnInit {

  @Input() relationshipName: string;
  @Input() relationshipIds: Array<ID>;
  @Input() isReview = false;
  @Output() changeIsValid = new EventEmitter<boolean>();
  @Output() backToEditPage = new EventEmitter<void>();
  @Output() relationshipsRemoved = new EventEmitter<ID>();

  relationshipFormArray: FormArray;

  constructor(private formBuilder: FormBuilder,
              private assetTypeQuery: AssetTypeQuery,
              private assetTypeTemplateQuery: AssetTypeTemplateQuery) {
  }

  ngOnInit(): void {
    if (!this.relationshipIds) {
      this.relationshipIds = new Array<ID>();
    }
    this.fillTable(this.relationshipIds);
  }

  private fillTable(relationshipIds: ID[]): void {
    this.relationshipFormArray = new FormArray([]);
    this.relationshipFormArray.valueChanges.subscribe(() => this.changeIsValid.emit(this.relationshipFormArray.valid));
    this.changeIsValid.emit(this.relationshipFormArray.valid);

    for (const relationshipId of relationshipIds) {
      const assetTypeTemplate: AssetTypeTemplate = AssetTypeTemplateWizardStepStartComponent
        .addPublishedVersionToAssetTypeTemplateName(this.assetTypeTemplateQuery.getEntity(relationshipId));
      this.addRelationship(assetTypeTemplate);
    }
    this.changeIsValid.emit(this.relationshipFormArray.valid);
  }

  public addRelationship(assetTypeTemplate: AssetTypeTemplate): void {
    const relationshipGroup = this.formBuilder.group({
      id: [],
      index: [this.relationshipFormArray.length],
      name: [],
      assetTypeName: [],
      imageKey: []
    });

    relationshipGroup.patchValue(assetTypeTemplate);
    const assetTypeName = assetTypeTemplate.assetType?.name ?? this.assetTypeQuery.getEntity(assetTypeTemplate.assetTypeId).name;
    relationshipGroup.get('assetTypeName').patchValue(assetTypeName);

    this.relationshipFormArray.push(relationshipGroup);
  }

  public removeRelationship(relationshipGroup: AbstractControl): void {
    if (this.isReview) {
      this.backToEditPage.emit();
      return;
    }

    if (relationshipGroup != null) {
      const removedRelationshipId = WizardHelper.removeSubsystemFromFormArray(relationshipGroup, this.relationshipFormArray);
      this.relationshipsRemoved.emit(removedRelationshipId);
    }
  }

  public getFormArray(): FormArray {
    return this.relationshipFormArray;
  }

  public onClickEdit(): void {
    this.backToEditPage.emit();
  }
}
