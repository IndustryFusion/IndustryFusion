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
import { ID } from '@datorama/akita';

import { AssetSeriesService } from '../../../../store/asset-series/asset-series.service';
import { ActivatedRoute } from '@angular/router';
import { AssetSeries } from '../../../../store/asset-series/asset-series.model';
import { Observable } from 'rxjs';
import { AssetSeriesComposedQuery } from '../../../../store/composed/asset-series-composed.query';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldSourceResolver } from '../../../../resolvers/field-source.resolver';
import { FieldTargetService } from '../../../../store/field-target/field-target.service';
import { FieldsResolver } from '../../../../resolvers/fields-resolver';

@Component({
  selector: 'app-asset-type-template-create',
  templateUrl: './asset-series-create.component.html',
  styleUrls: ['./asset-series-create.component.scss']
})
export class AssetSeriesCreateComponent implements OnInit {
  private readonly route: ActivatedRoute;

  constructor(private assetSeriesService: AssetSeriesService,
              private assetSeriesQuery: AssetSeriesComposedQuery,
              private dialogConfig: DynamicDialogConfig,
              private dynamicDialogRef: DynamicDialogRef,
              private fieldSourceResolver: FieldSourceResolver,
              private fieldTargetService: FieldTargetService,
              private fieldsResolver: FieldsResolver
  ) {
    this.route = dialogConfig.data.route;
    this.companyId = this.route.parent.snapshot.paramMap.get('companyId');
    this.resolve();
  }

  step = 1;
  assetType: ID;
  companyId: ID;
  error: any;
  toalSteps = 4;
  assetSeries$: Observable<AssetSeries>;
  assetSeries: AssetSeries = new AssetSeries();

  ngOnInit() {
    const assetSeriesId = this.dialogConfig.data.assetSeriesId;
    console.log('assetSeriesId', assetSeriesId);
    this.assetSeries$ = this.assetSeriesQuery.selectAssetSeries(assetSeriesId);
    this.assetSeriesService.getItem(this.companyId, assetSeriesId)
      .subscribe(assetSeries => this.assetSeries = assetSeries);
  }

  onStepChange(step: number) {
    this.error = undefined;
    this.step = step;
    if (this.assetSeries?.id || this.assetSeries?.assetTypeTemplateId) {
      this.onUpdateAssetSeries();
    }
    const queryParams: any = { step: this.step};
    if (this.assetSeries?.id) {
      queryParams.id = this.assetSeries.id;
    }
  }

  onUpdateAssetSeries() {
    if (this.assetSeries.id) {
      this.assetSeriesService.editItem(this.assetSeries.id, this.assetSeries)
        .subscribe(newAssetSeries => this.assetSeries = newAssetSeries);
    } else {
      this.assetSeries.companyId = this.companyId;
      this.assetSeriesService.createItem(this.assetSeries.companyId, this.assetSeries.assetTypeTemplateId)
        .subscribe(newAssetSeries => this.assetSeries = newAssetSeries);
    }
  }

  onCloseError() {
    this.error = undefined;
  }

  onError(error: string) {
    this.error = error;
  }

  nextStep() {
    if (this.step === this.toalSteps) {
      this.dynamicDialogRef.close();
    } else {
      this.step++;
    }
  }

  back() {
    if (this.step === 1) {
      this.dynamicDialogRef.close();
    } else {
      this.step--;
    }
  }

  readyToTakeNextStep(): boolean {
    let result = true;
    switch (this.step) {
      case 1:
        result = this.assetSeries?.name !== undefined;
        break;
    }
    return result;
  }

  private resolve() {
    this.fieldSourceResolver.resolve(this.route.snapshot);
    if (this.assetSeries?.assetTypeTemplateId) {
      this.fieldTargetService.getItemsByAssetTypeTemplate(this.assetSeries.assetTypeTemplateId).subscribe();
    }
    this.fieldsResolver.resolve().subscribe();
  }
}
