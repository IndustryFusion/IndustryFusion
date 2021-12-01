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

import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ID } from '@datorama/akita';
import { AssetTypeTemplate } from '../../../../../../../core/store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateService } from '../../../../../../../core/store/asset-type-template/asset-type-template.service';
import { AssetTypeTemplateWizardSteps } from '../../asset-type-template-wizard-steps.model';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators';
import { AssetTypeTemplateWizardStepStartComponent } from '../asset-type-template-wizard-step-start/asset-type-template-wizard-step-start.component';
import { AssetTypeTemplateWizardSharedRelationshipsComponent } from '../../asset-type-template-wizard-shared/asset-type-template-wizard-shared-relationship/asset-type-template-wizard-shared-relationships.component';
import { AssetTypeTemplateQuery } from '../../../../../../../core/store/asset-type-template/asset-type-template.query';

@Component({
  selector: 'app-asset-type-template-wizard-step-subsystems',
  templateUrl: './asset-type-template-wizard-step-subsystems.component.html',
  styleUrls: ['./asset-type-template-wizard-step-subsystems.component.scss']
})
export class AssetTypeTemplateWizardStepSubsystemsComponent implements OnInit {

  @ViewChild(AssetTypeTemplateWizardSharedRelationshipsComponent) subsystemsChild: AssetTypeTemplateWizardSharedRelationshipsComponent;

  @Input() assetTypeTemplate: AssetTypeTemplate;
  @Input() assetTypeTemplateForm: FormGroup;
  @Output() valid = new EventEmitter<boolean>();
  @Output() stepChange = new EventEmitter<number>();

  public subsystemCandidates: AssetTypeTemplate[];
  public removedCandidates: AssetTypeTemplate[];
  public isReadyForNextStep = false;
  public isAddingMode = false;

  constructor(private assetTypeTemplateService: AssetTypeTemplateService,
              private assetTypeTemplateQuery: AssetTypeTemplateQuery) {
    this.removedCandidates = [];
  }

  ngOnInit(): void {
    this.initFilteredSubsystemCandidatesIncludingVersion();
    this.addAddedSubsystemsToRemovedCandidates();
  }

  private initFilteredSubsystemCandidatesIncludingVersion() {
    const assetTypeTemplateId = this.assetTypeTemplateForm.get('id').value;
    const assetTypeId = this.assetTypeTemplateForm.get('assetTypeId').value;

    this.assetTypeTemplateService.getSubsystemCandidates(assetTypeTemplateId ?? 0, assetTypeId)
      .pipe(map( (candidates: AssetTypeTemplate[]) =>
          candidates.map(candidate => AssetTypeTemplateWizardStepStartComponent.addPublishedVersionToAssetTypeTemplateName(candidate))),
        map(candidates => candidates.filter(candidate => !this.assetTypeTemplate.subsystemIds.includes(candidate.id) )),
        map(candidates => candidates.filter(candidate => !this.assetTypeTemplate.peerIds.includes(candidate.id) )))
      .subscribe(templateCandidates => this.subsystemCandidates = templateCandidates);
  }

  private addAddedSubsystemsToRemovedCandidates() {
    this.assetTypeTemplate.subsystemIds?.forEach(subsystemId => {
      const addedSubsystem = this.assetTypeTemplateQuery.getEntity(subsystemId);
      if (addedSubsystem) {
        this.removedCandidates.push(AssetTypeTemplateWizardStepStartComponent.addPublishedVersionToAssetTypeTemplateName(addedSubsystem));
      } else {
        console.warn('[ATT wizard]: Subsystem could not be found in candidates');
      }
    });
  }

  public onBack(): void {
    if (this.isReadyForNextStep) {
      this.stepChange.emit(AssetTypeTemplateWizardSteps.SUBSYSTEMS - 1);
    }
  }

  public onNext(): void {
    if (this.isReadyForNextStep) {
      this.saveValues();
      this.stepChange.emit(AssetTypeTemplateWizardSteps.SUBSYSTEMS + 1);
    }
  }

  private saveValues(): void {
    const subsystemFormArray: FormArray = this.subsystemsChild.getFormArray();
    if (subsystemFormArray.valid) {
      this.assetTypeTemplate.subsystemIds = new Array<ID>();
      subsystemFormArray.controls.forEach((subsystemGroup: FormControl) => {
        this.assetTypeTemplate.subsystemIds.push(subsystemGroup.get('id').value);
      });
    }
  }

  public onSetValid(isValid: boolean): void {
    this.isReadyForNextStep = isValid;
    this.valid.emit(isValid);
  }

  public startAddingMode(): void {
    this.isAddingMode = true;
  }

  public addSubsystem(assetTypeTemplate: AssetTypeTemplate): void {
    this.subsystemsChild.addRelationship(assetTypeTemplate);
    this.removedCandidates.push(assetTypeTemplate);
    this.subsystemCandidates.splice(this.subsystemCandidates.indexOf(assetTypeTemplate), 1);
    this.isAddingMode = false;
  }

  public onSubsystemRemoved(subsystemId: ID): void {
    const removedAssetTypeTemplate = this.removedCandidates.find((item: AssetTypeTemplate) => item.id === subsystemId);
    if (!removedAssetTypeTemplate) {
      console.warn('[ATT wizard]: Removed subsystem could not be found');
      return;
    }

    this.addRemovedSubsystemToCandidates(removedAssetTypeTemplate);
    this.removedCandidates.splice(this.removedCandidates.indexOf(removedAssetTypeTemplate), 1);
  }

  private addRemovedSubsystemToCandidates(removedAssetTypeTemplate: AssetTypeTemplate) {
    if (removedAssetTypeTemplate) {
      this.subsystemCandidates.push(removedAssetTypeTemplate);
      this.subsystemCandidates.sort((a, b) => (a.id as number) - (b.id as number));
    }
  }
}
