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
import { AssetTypeTemplateWizardSharedSubsystemsComponent } from '../../asset-type-template-wizard-shared/asset-type-template-wizard-shared-subsystems/asset-type-template-wizard-shared-subsystems.component';
import { AssetTypeTemplateWizardSteps } from '../../asset-type-template-wizard-steps.model';
import { FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators';
import { AssetTypeTemplateWizardStepStartComponent } from '../asset-type-template-wizard-step-start/asset-type-template-wizard-step-start.component';

@Component({
  selector: 'app-asset-type-template-wizard-step-subsystems',
  templateUrl: './asset-type-template-wizard-step-subsystems.component.html',
  styleUrls: ['./asset-type-template-wizard-step-subsystems.component.scss']
})
export class AssetTypeTemplateWizardStepSubsystemsComponent implements OnInit {

  @ViewChild(AssetTypeTemplateWizardSharedSubsystemsComponent) subsystemsChild: AssetTypeTemplateWizardSharedSubsystemsComponent;

  @Input() assetTypeTemplate: AssetTypeTemplate;
  @Input() assetTypeTemplateForm: FormGroup;
  @Output() valid = new EventEmitter<boolean>();
  @Output() stepChange = new EventEmitter<number>();

  public subsystemCandidates: AssetTypeTemplate[];
  public removedCandidates: AssetTypeTemplate[];
  public isReadyForNextStep = false;
  public isAddingMode = false;

  constructor(private assetTypeTemplateService: AssetTypeTemplateService) {
    this.removedCandidates = [];
  }

  ngOnInit(): void {
    this.initFilteredSubsystemCandidatesIncludingVersion();
  }

  private initFilteredSubsystemCandidatesIncludingVersion() {
    const assetTypeTemplateId = this.assetTypeTemplateForm.get('id').value;
    const assetTypeId = this.assetTypeTemplateForm.get('assetTypeId').value;
    this.assetTypeTemplateService.getSubsystemCandidates(assetTypeTemplateId ?? 0, assetTypeId)
      .pipe(map( (templates: AssetTypeTemplate[]) =>
          templates.map(template => AssetTypeTemplateWizardStepStartComponent.addPublishedVersionToAssetTypeTemplateName(template))),
        map(templates => templates.filter(template => !this.assetTypeTemplate.subsystemIds.includes(template.id) )))
      .subscribe(templateCandidates => this.subsystemCandidates = templateCandidates);
  }

  public onBack(): void {
    if (this.isReadyForNextStep) {
      this.stepChange.emit(AssetTypeTemplateWizardSteps.SUBSYSTEMS - 1);
    }
  }

  public onNext(): void {
    if (this.isReadyForNextStep) {
      this.subsystemsChild.saveValues();
      this.stepChange.emit(AssetTypeTemplateWizardSteps.SUBSYSTEMS + 1);
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
    this.subsystemsChild.addSubsystem(assetTypeTemplate);
    this.removedCandidates.push(assetTypeTemplate);
    this.subsystemCandidates.splice(this.subsystemCandidates.indexOf(assetTypeTemplate), 1);
    this.isAddingMode = false;
  }

  public onSubsystemRemoved(subsystemId: ID): void {
    const assetTypeTemplate = this.removedCandidates.find((item: AssetTypeTemplate) => item.id === subsystemId);
    this.subsystemCandidates.push(assetTypeTemplate);
    this.subsystemCandidates.sort((a, b) => (a.id as number) - (b.id as number));
    this.removedCandidates.splice(this.removedCandidates.indexOf(assetTypeTemplate), 1);
  }
}
