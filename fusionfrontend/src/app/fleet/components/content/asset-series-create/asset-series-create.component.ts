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
import { AssetSeries } from '../../../../store/asset-series/asset-series.model';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ViewMode } from './view-mode.enum';
import { FieldService } from '../../../../store/field/field.service';

@Component({
  selector: 'app-asset-type-template-create',
  templateUrl: './asset-series-create.component.html',
  styleUrls: ['./asset-series-create.component.scss']
})
export class AssetSeriesCreateComponent implements OnInit {

  assetType: ID;
  companyId: ID;
  error: any;
  step = 1;
  toalSteps = 4;
  assetSeries: AssetSeries = new AssetSeries();
  mode: ViewMode = ViewMode.CREATE;

  constructor(private assetSeriesService: AssetSeriesService,
              fieldService: FieldService,
              private dialogConfig: DynamicDialogConfig,
              private dynamicDialogRef: DynamicDialogRef,
  ) {
    fieldService.getItems().subscribe();
    this.companyId = dialogConfig.data.companyId;
    const assetSeriesId = this.dialogConfig.data.assetSeriesId;
    if (assetSeriesId) {
      this.mode = ViewMode.EDIT;
    } else {
      this.mode = ViewMode.CREATE;
    }

    if (this.mode === ViewMode.EDIT) {
      this.assetSeriesService.getAssetSeries(this.companyId, assetSeriesId)
        .subscribe(assetSeries => this.assetSeries = assetSeries);
    }
  }

  ngOnInit() {
  }

  createAssetseriesOfAssetTypeTemplate(assetTypeTemplateId: ID) {
    this.assetSeriesService.getItemByAssetTypeTemplate(this.companyId, assetTypeTemplateId)
          .subscribe(assetSeries => this.assetSeries = assetSeries);
  }

  onCloseError() {
    this.error = undefined;
  }

  onError(error: string) {
    this.error = error;
  }

  nextStep() {
    if (this.step === this.toalSteps) {
      this.saveAssetseries();
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


  private saveAssetseries() {
      if (this.assetSeries.id) {
        this.assetSeriesService.editItem(this.assetSeries.id, this.assetSeries).subscribe(
        () => this.dynamicDialogRef.close()
        );
      } else {
        this.assetSeriesService.createItem(this.assetSeries.companyId, this.assetSeries)
          .subscribe(() => this.dynamicDialogRef.close());
      }
  }
}
