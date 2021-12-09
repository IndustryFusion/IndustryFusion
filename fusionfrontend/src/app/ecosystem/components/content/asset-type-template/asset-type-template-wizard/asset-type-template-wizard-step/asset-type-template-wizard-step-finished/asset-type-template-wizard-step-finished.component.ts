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

import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogType } from '../../../../../../../shared/models/dialog-type.model';

@Component({
  selector: 'app-asset-type-template-wizard-step-finished',
  templateUrl: './asset-type-template-wizard-step-finished.component.html',
  styleUrls: ['./asset-type-template-wizard-step-finished.component.scss']
})
export class AssetTypeTemplateWizardStepFinishedComponent implements OnInit {

  @Input() type: DialogType;
  @Input() assetTypeTemplateForm: FormGroup;

  public DialogType = DialogType;

  constructor(public ref: DynamicDialogRef) { }

  ngOnInit() {
  }

  onFinish() {
    this.ref.close();
  }
}
