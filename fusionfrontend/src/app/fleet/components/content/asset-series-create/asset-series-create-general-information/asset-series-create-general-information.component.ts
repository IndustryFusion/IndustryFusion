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
import { ActivatedRoute } from '@angular/router';
import { AssetSeries } from '../../../../../store/asset-series/asset-series.model';

@Component({
  selector: 'app-asset-series-create-general-information',
  templateUrl: './asset-series-create-general-information.component.html',
  styleUrls: ['./asset-series-create-general-information.component.scss']
})
export class AssetSeriesCreateGeneralInformationComponent implements OnInit {

  @Output() errorSignal = new EventEmitter<string>();
  @Input() assetSeries: AssetSeries = new AssetSeries();

  assetTypeTemplates$: Observable<AssetTypeTemplate[]>;

  assetTypeTemplates: AssetTypeTemplate[];

  id: string;

  constructor(
    private assetTypeTemplateQuery: AssetTypeTemplateQuery,
    private route: ActivatedRoute
  ) {
    this.assetTypeTemplates = this.assetTypeTemplateQuery.getAll();
  }

  ngOnInit() {
    this.id = this.route.snapshot.queryParamMap.get('id');
    this.assetTypeTemplates$ = this.assetTypeTemplateQuery.selectAll();
  }

  updateTypeTemplate(id: any) {
    const assetTypeTemplate = this.assetTypeTemplates.find(template => template.id === id);
    this.assetSeries.name = assetTypeTemplate.name;
    this.assetSeries.description = assetTypeTemplate.description;
  }
}
