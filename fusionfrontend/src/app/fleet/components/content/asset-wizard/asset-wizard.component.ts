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

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Asset } from '../../../../store/asset/asset.model';
import { DialogType } from '../../../../common/models/dialog-type.model';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { AssetWizardStep } from './asset-wizard-step.model';

@Component({
  selector: 'app-asset-wizard',
  templateUrl: './asset-wizard.component.html',
  styleUrls: ['./asset-wizard.component.scss']
})
export class AssetWizardComponent implements OnInit {

  public assetForm: FormGroup;
  public asset: Asset;
  public type = DialogType.CREATE;
  public step = AssetWizardStep.START;

  constructor(private formBuilder: FormBuilder,
              private config: DynamicDialogConfig) { }

  ngOnInit(): void {
    if (this.config.data.step) {
      this.onStepChange(this.config.data.step);
    }
    this.asset = { ...this.config.data.asset };
    this.createAssetForm();
  }

  onStepChange(step: number) {
    this.step = step;
  }

  private createAssetForm() {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    const companyId = this.config.data.companyId;
    const assetSeriesId = this.config.data.assetSeriesId;

    this.assetForm = this.formBuilder.group({
      id: [],
      name: ['', requiredTextValidator],
      description: ['', Validators.maxLength(255)],
      companyId: [companyId, Validators.required],
      assetSeriesId: [assetSeriesId, Validators.required],
      roomId: [],
      externalId: [null, Validators.maxLength(255)],
      controlSystemType: [null, Validators.maxLength(255)],
      hasGateway: [],
      gatewayConnectivity: [null, Validators.maxLength(255)],
      guid: [],
      ceCertified: [],
      serialNumber: [null, Validators.maxLength(255)],
      constructionDate: [],
      protectionClass: [null, Validators.maxLength(255)],
      handbookKey: [null, Validators.maxLength(255)],
      videoKey: [null, Validators.maxLength(255)],
      installationDate: [],
      imageKey: [null, Validators.maxLength(255)]
    });
    this.assetForm.patchValue(this.asset);
  }
}
