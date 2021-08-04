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

import { Observable } from 'rxjs';

import { AssetTypeTemplate } from '../../../../../store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateQuery } from '../../../../../store/asset-type-template/asset-type-template.query';
import { ID } from '@datorama/akita';
import { DialogType } from '../../../../../common/models/dialog-type.model';
import { FormGroup } from '@angular/forms';
import { AssetSeries } from '../../../../../store/asset-series/asset-series.model';
import { Company } from '../../../../../store/company/company.model';
import { AssetType } from '../../../../../store/asset-type/asset-type.model';

@Component({
  selector: 'app-asset-series-create-general-information',
  templateUrl: './asset-series-create-general-information.component.html',
  styleUrls: ['./asset-series-create-general-information.component.scss']
})
export class AssetSeriesCreateGeneralInformationComponent implements OnInit {

  @Input() mode: DialogType = DialogType.EDIT;
  @Input() assetSeries: AssetSeries;
  @Input() assetSeriesForm: FormGroup;
  @Input() relatedManufacturer: Company;
  @Input() relatedAssetType: AssetType;
  @Output() updateTypeTemplate = new EventEmitter<ID>();

  assetTypeTemplates$: Observable<AssetTypeTemplate[]>;
  DialogType = DialogType;

  constructor(private assetTypeTemplateQuery: AssetTypeTemplateQuery) {
  }

  ngOnInit() {
    this.assetTypeTemplates$ = this.assetTypeTemplateQuery.selectAll();
  }

}
