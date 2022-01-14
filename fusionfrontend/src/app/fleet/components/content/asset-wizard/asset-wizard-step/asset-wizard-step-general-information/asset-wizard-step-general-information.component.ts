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
import { AssetSeries } from '../../../../../../core/store/asset-series/asset-series.model';
import { AssetSeriesQuery } from '../../../../../../core/store/asset-series/asset-series.query';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { AssetWizardStep } from '../asset-wizard-step.model';
import { Company } from '../../../../../../core/store/company/company.model';
import { AssetType } from '../../../../../../core/store/asset-type/asset-type.model';
import { WizardHelper } from '../../../../../../core/helpers/wizard-helper';
import { ImageService } from '../../../../../../core/services/api/image.service';
import { CompanyQuery } from '../../../../../../core/store/company/company.query';
import { DialogType } from '../../../../../../shared/models/dialog-type.model';

@Component({
  selector: 'app-asset-wizard-step-general-information',
  templateUrl: './asset-wizard-step-general-information.component.html',
  styleUrls: ['./asset-wizard-step-general-information.component.scss']
})
export class AssetWizardStepGeneralInformationComponent implements OnInit {

  @Input() assetForm: FormGroup;
  @Input() type: DialogType;
  @Input() relatedAssetSeries: AssetSeries;
  @Input() relatedAssetSeriesId: ID;
  @Input() relatedCompany: Company;
  @Input() relatedAssetType: AssetType;
  @Input() isAssetSeriesLocked: boolean;
  @Input() assetImage: string;
  @Output() changeAssetSeries = new EventEmitter<ID>();
  @Output() stepChange = new EventEmitter<AssetWizardStep>();
  @Output() assetImageChanged = new EventEmitter<string>();

  public assetSeries$: Observable<AssetSeries[]>;

  public MAX_TEXT_LENGTH = WizardHelper.MAX_TEXT_LENGTH;
  public DEFAULT_ASSET_IMAGE_KEY = ImageService.DEFAULT_ASSET_IMAGE_KEY;
  public DialogType = DialogType;

  private companyId: ID;

  constructor(private assetSeriesQuery: AssetSeriesQuery,
              private companyQuery: CompanyQuery,
              private imageService: ImageService,
              private wizardRef: DynamicDialogRef) { }

  ngOnInit(): void {
    this.assetSeries$ = this.assetSeriesQuery.selectAll();
    if (this.isAssetSeriesLocked) {
      this.assetForm.get('assetSeriesId')?.disable();
      this.assetForm.get('assetSeriesId').setValue(this.relatedAssetSeriesId);
    }

    this.companyId = this.companyQuery.getActiveId();
  }

  onChangeAssetSeries(assetSeriesId: ID): void {
    this.changeAssetSeries.emit(assetSeriesId);
  }

  isReadyForNextStep(): boolean {
    return this.assetForm.get('assetSeriesId').value != null
      && this.assetForm.get('name').value != null
      && this.assetForm.get('description').value != null;
  }

  onCancel(): void {
    this.wizardRef?.close();
  }

  onStart(): void {
    if (this.isReadyForNextStep()) {
      this.stepChange.emit(AssetWizardStep.GENERAL_INFORMATION + 1);
    }
  }

  onImageUpload(event: any): void {
    this.deletePreviouslyUploadedImage();

    const selectedImage: any = event.target.files[0];
    if (selectedImage) {
      const reader = new FileReader();
      reader.addEventListener('load', (readFileEvent: any) => {
        this.imageService.uploadImage(this.companyId, selectedImage.name, 'assets', readFileEvent.target.result, selectedImage.size)
          .subscribe(uploadedImage => {
            this.assetImage = uploadedImage.contentBase64;
            this.assetImageChanged.emit(this.assetImage);
            this.assetForm.get('imageKey').setValue(uploadedImage.fileKey);
          });
      });

      reader.readAsDataURL(selectedImage);
    }
  }

  private deletePreviouslyUploadedImage(): void {
    if (this.assetImage) {
      const companyId = this.companyQuery.getActiveId();
      this.imageService.deleteImageIfNotDefaultNorParent(companyId, this.assetForm.get('imageKey').value,
        ImageService.DEFAULT_ASSET_IMAGE_KEY, this.relatedAssetSeries.imageKey).subscribe();
    }
  }
}
