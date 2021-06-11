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
import { FormGroup } from '@angular/forms';
import { AssetTypeTemplateWizardSteps } from '../asset-type-template-wizard-steps.model';

@Component({
  selector: 'app-asset-type-template-wizard-step-publish',
  templateUrl: './asset-type-template-wizard-step-publish.component.html',
  styleUrls: ['./asset-type-template-wizard-step-publish.component.scss']
})
export class AssetTypeTemplateWizardStepPublishComponent implements OnInit {

  @Input() assetTypeTemplateForm: FormGroup;
  @Output() stepChange = new EventEmitter<number>();
  @Output() saveTemplate = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onBack() {
    this.stepChange.emit(AssetTypeTemplateWizardSteps.OVERVIEW);
  }

  onPublish() {
    this.assetTypeTemplateForm?.get('published')?.setValue(true);
    this.assetTypeTemplateForm?.get('publishedDate')?.setValue(new Date());
    this.assetTypeTemplateForm?.get('wasPublished')?.setValue(true);
    this.saveTemplate.emit();
    this.stepChange.emit(AssetTypeTemplateWizardSteps.FINISHED);
  }
}
