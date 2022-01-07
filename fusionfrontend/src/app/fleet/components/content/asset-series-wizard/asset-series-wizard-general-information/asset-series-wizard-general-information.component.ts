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
import { AssetTypeTemplateQuery } from '../../../../../core/store/asset-type-template/asset-type-template.query';
import { ID } from '@datorama/akita';
import { DialogType } from '../../../../../shared/models/dialog-type.model';
import { FormGroup } from '@angular/forms';
import { Company } from '../../../../../core/store/company/company.model';
import { AssetType } from '../../../../../core/store/asset-type/asset-type.model';
import { SelectItem } from 'primeng/api';
import { NameWithVersionPipe } from 'src/app/shared/pipes/namewithversion.pipe';
import { ImageService } from '../../../../../core/services/api/image.service';
import { CompanyQuery } from '../../../../../core/store/company/company.query';

@Component({
  selector: 'app-asset-series-wizard-general-information',
  templateUrl: './asset-series-wizard-general-information.component.html',
  styleUrls: ['./asset-series-wizard-general-information.component.scss']
})
export class AssetSeriesWizardGeneralInformationComponent implements OnInit {

  @Input() assetSeriesForm: FormGroup;
  @Input() relatedManufacturer: Company;
  @Input() relatedAssetType: AssetType;
  @Input() assetSeriesImage: string;
  @Output() updateTypeTemplate = new EventEmitter<ID>();
  @Output() assetSeriesImageChanged = new EventEmitter<string>();

  assetTypeTemplateOptions: SelectItem[] = [];
  DialogType = DialogType;
  DEFAULT_ASSET_IMAGE_KEY = ImageService.DEFAULT_ASSET_SERIES_IMAGE_KEY;

  private companyId: ID;

  constructor(private assetTypeTemplateQuery: AssetTypeTemplateQuery,
              private companyQuery: CompanyQuery,
              private imageService: ImageService) {
  }

  ngOnInit() {
    this.initAssetTypeTemplateOptions();
    this.companyId = this.companyQuery.getActiveId();
  }

  private initAssetTypeTemplateOptions() {
    this.assetTypeTemplateQuery.selectAll().subscribe(assetTypeTemplates => {
      for (const assetTypeTemplate of assetTypeTemplates) {
        this.assetTypeTemplateOptions.push({
          label: new NameWithVersionPipe().transform(assetTypeTemplate.name, assetTypeTemplate.publishedVersion),
          value: assetTypeTemplate.id
        });
      }
    });
  }

  onImageUpload(event: any): void {
    this.deletePreviouslyUploadedImage();

    const selectedImage: any = event.target.files[0];
    if (selectedImage) {
      const reader = new FileReader();
      reader.addEventListener('load', (readFileEvent: any) => {
        this.imageService.uploadImage(this.companyId, selectedImage.name, 'assetseries', readFileEvent.target.result, selectedImage.size)
          .subscribe(uploadedImage => {
            this.assetSeriesImage = uploadedImage.contentBase64;
            this.assetSeriesImageChanged.emit(this.assetSeriesImage);
            this.assetSeriesForm.get('imageKey').setValue(uploadedImage.fileKey);
          });
      });

      reader.readAsDataURL(selectedImage);
    }
  }

  private deletePreviouslyUploadedImage(): void {
    if (this.assetSeriesImage) {
      this.imageService.deleteImage(this.companyId, this.assetSeriesForm.get('imageKey').value).subscribe();
    }
  }

}
