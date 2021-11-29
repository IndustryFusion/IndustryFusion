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

import { FieldTarget, FieldType } from '../../../../../../../core/store/field-target/field-target.model';
import { FormGroup } from '@angular/forms';
import { AssetTypeTemplateWizardSteps } from '../../asset-type-template-wizard-steps.model';

@Component({
  selector: 'app-asset-type-template-wizard-step-review',
  templateUrl: './asset-type-template-wizard-step-review.component.html',
  styleUrls: ['./asset-type-template-wizard-step-review.component.scss']
})
export class AssetTypeTemplateWizardStepReviewComponent implements OnInit {

  @Input() assetTypeTemplateForm: FormGroup;
  @Input() metrics: Array<FieldTarget>;
  @Input() attributes: Array<FieldTarget>;
  @Output() stepChange = new EventEmitter<number>();
  @Output() saveTemplate = new EventEmitter();

  public FieldType = FieldType;

  constructor() { }

  ngOnInit() { }

  onBackToAttributes() {
    this.changeStep(AssetTypeTemplateWizardSteps.ATTRIBUTES);
  }

  onBackToMetrics() {
    this.changeStep(AssetTypeTemplateWizardSteps.METRICS);
  }

  onSave() {
    this.saveTemplate.emit();
    this.changeStep(AssetTypeTemplateWizardSteps.FINISHED);
  }

  onGoToConfirmPublish() {
    this.changeStep(AssetTypeTemplateWizardSteps.PUBLISH_CONFIRM);
  }

  private changeStep(step: number) {
    this.stepChange.emit(step);
  }

  onBack() {
    this.changeStep(AssetTypeTemplateWizardSteps.REVIEW - 1);
  }
}
