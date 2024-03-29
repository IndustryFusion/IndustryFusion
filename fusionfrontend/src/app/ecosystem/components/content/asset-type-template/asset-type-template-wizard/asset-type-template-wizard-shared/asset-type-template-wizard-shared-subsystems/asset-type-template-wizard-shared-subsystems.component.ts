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

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder } from '@angular/forms';
import { ID } from '@datorama/akita';
import { AssetTypeTemplate } from '../../../../../../../core/store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateQuery } from '../../../../../../../core/store/asset-type-template/asset-type-template.query';
import { WizardHelper } from '../../../../../../../core/helpers/wizard-helper';
import { AssetTypeQuery } from '../../../../../../../core/store/asset-type/asset-type.query';
import { AssetTypeTemplateWizardStepStartComponent } from '../../asset-type-template-wizard-step/asset-type-template-wizard-step-start/asset-type-template-wizard-step-start.component';

@Component({
  selector: 'app-asset-type-template-wizard-shared-subsystems',
  templateUrl: './asset-type-template-wizard-shared-subsystems.component.html',
  styleUrls: ['./asset-type-template-wizard-shared-subsystems.component.scss']
})
export class AssetTypeTemplateWizardSharedSubsystemsComponent implements OnInit, OnChanges {

  @Input() subsystemIds: Array<ID>;
  @Input() isReview = false;
  @Input() editable = true;
  @Output() changeIsValid = new EventEmitter<boolean>();
  @Output() backToEditPage = new EventEmitter<void>();
  @Output() subsystemsRemoved = new EventEmitter<ID>();

  subsystemFormArray: FormArray;

  constructor(private formBuilder: FormBuilder,
              private assetTypeQuery: AssetTypeQuery,
              private assetTypeTemplateQuery: AssetTypeTemplateQuery) {
  }

  ngOnInit(): void {
    if (!this.subsystemIds) {
      this.subsystemIds = new Array<ID>();
    }
    this.initFormArray();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.subsystemIds && !changes.subsystemIds.firstChange) {
      this.initFormArray();
    }
  }

  private initFormArray(): void {
    this.subsystemFormArray = new FormArray([]);
    this.subsystemFormArray.valueChanges.subscribe(() => this.changeIsValid.emit(this.subsystemFormArray.valid));
    this.changeIsValid.emit(this.subsystemFormArray.valid);

    for (const subsystemId of this.subsystemIds) {
      const assetTypeTemplate: AssetTypeTemplate = AssetTypeTemplateWizardStepStartComponent
        .addPublishedVersionToAssetTypeTemplateName(this.assetTypeTemplateQuery.getEntity(subsystemId));
      this.addSubsystem(assetTypeTemplate);
    }
    this.changeIsValid.emit(this.subsystemFormArray.valid);
  }

  public addSubsystem(assetTypeTemplate: AssetTypeTemplate): void {
    const subsystemGroup = this.formBuilder.group({
      id: [],
      index: [this.subsystemFormArray.length],
      name: [],
      assetTypeName: [],
      imageKey: []
    });

    subsystemGroup.patchValue(assetTypeTemplate);
    const assetTypeName = assetTypeTemplate.assetType?.name ?? this.assetTypeQuery.getEntity(assetTypeTemplate.assetTypeId).name;
    subsystemGroup.get('assetTypeName').patchValue(assetTypeName);

    this.subsystemFormArray.push(subsystemGroup);
  }

  public removeSubsystem(subsystemGroup: AbstractControl): void {
    if (this.isReview) {
      this.backToEditPage.emit();
      return;
    }

    if (subsystemGroup != null) {
      const removedSubsystemId = WizardHelper.removeSubsystemFromFormArray(subsystemGroup, this.subsystemFormArray);
      this.subsystemsRemoved.emit(removedSubsystemId);
    }
  }

  public getFormArray(): FormArray {
    return this.subsystemFormArray;
  }

  public onClickEdit(): void {
    this.backToEditPage.emit();
  }
}
