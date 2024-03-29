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

@Component({
  selector: 'app-asset-type-template-wizard-warning-dialog',
  templateUrl: './asset-type-template-wizard-warning-dialog.component.html',
  styleUrls: ['./asset-type-template-wizard-warning-dialog.component.scss']
})
export class AssetTypeTemplateWizardWarningDialogComponent implements OnInit {

  @Input() assetTypeTemplateForm: FormGroup;

  constructor(public ref: DynamicDialogRef) { }

  ngOnInit(): void {
  }

  onCancel() {
    this.ref.close();
  }

  onGoToTemplate() {
    this.ref.close(true);
  }
}
