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

@Component({
  selector: 'app-asset-series-wizard-general-information',
  templateUrl: './asset-series-wizard-general-information.component.html',
  styleUrls: ['./asset-series-wizard-general-information.component.scss']
})
export class AssetSeriesWizardGeneralInformationComponent implements OnInit {

  @Input() assetSeriesForm: FormGroup;
  @Input() relatedManufacturer: Company;
  @Input() relatedAssetType: AssetType;
  @Output() updateTypeTemplate = new EventEmitter<ID>();

  assetTypeTemplateOptions: SelectItem[] = [];
  DialogType = DialogType;

  constructor(private assetTypeTemplateQuery: AssetTypeTemplateQuery) {
  }

  ngOnInit() {
    this.initAssetTypeTemplateOptions();
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

}
