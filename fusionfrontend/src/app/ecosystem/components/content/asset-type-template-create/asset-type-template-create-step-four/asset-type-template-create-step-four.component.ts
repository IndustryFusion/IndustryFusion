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

import { FieldTarget } from '../../../../../store/field-target/field-target.model';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-asset-type-template-create-step-four',
  templateUrl: './asset-type-template-create-step-four.component.html',
  styleUrls: ['./asset-type-template-create-step-four.component.scss']
})
export class AssetTypeTemplateCreateStepFourComponent implements OnInit {

  @Input() assetTypeTemplateForm: FormGroup;
  @Input() metrics: Array<FieldTarget>;
  @Input() attributes: Array<FieldTarget>;
  @Output() stepChange = new EventEmitter<number>();
  @Output() saveTemplate = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  onBackToAttributes() {
    this.changeStep(3);
  }

  onBackToMetrics() {
    this.changeStep(2);
  }

  onSave() {
    this.saveTemplate.emit();
    this.changeStep(5);
  }

  onGoToPublish() {
    this.changeStep(6);
  }

  private changeStep(step: number) {
    this.stepChange.emit(step);
  }

}
