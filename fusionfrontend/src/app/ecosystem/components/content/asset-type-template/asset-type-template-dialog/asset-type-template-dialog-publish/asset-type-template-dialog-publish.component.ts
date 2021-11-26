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


import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AssetTypeTemplateWizardComponent } from '../../asset-type-template-wizard/asset-type-template-wizard.component';

@Component({
  selector: 'app-asset-type-template-dialog-publish',
  templateUrl: './asset-type-template-dialog-publish.component.html',
  styleUrls: ['./asset-type-template-dialog-publish.component.scss']
})
export class AssetTypeTemplateDialogPublishComponent implements OnInit, OnDestroy {

  public assetTypeTemplateForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private config: DynamicDialogConfig,
              public ref: DynamicDialogRef) {
  }

  ngOnInit(): void {
    this.assetTypeTemplateForm = AssetTypeTemplateWizardComponent
      .createAssetTypeTemplateForm(this.formBuilder, this.config.data.assetTypeTemplate, null);
  }

  ngOnDestroy() {
    this.ref?.close(null);
  }

  onClose() {
    this.ref?.close(null);
  }

  onPublish() {
    this.ref?.close(this.assetTypeTemplateForm);
  }
}
