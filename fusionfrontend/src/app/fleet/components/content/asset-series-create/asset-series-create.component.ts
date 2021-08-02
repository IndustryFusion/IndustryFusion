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

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ID } from '@datorama/akita';

import { AssetSeriesService } from '../../../../store/asset-series/asset-series.service';
import { AssetSeries } from '../../../../store/asset-series/asset-series.model';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldService } from '../../../../store/field/field.service';
import { DialogType } from '../../../../common/models/dialog-type.model';
import { AssetSeriesCreateSteps } from './asset-series-create-steps.model';

@Component({
  selector: 'app-asset-series-create',
  templateUrl: './asset-series-create.component.html',
  styleUrls: ['./asset-series-create.component.scss']
})
export class AssetSeriesCreateComponent implements OnInit {

  assetType: ID;
  companyId: ID;
  step: AssetSeriesCreateSteps = AssetSeriesCreateSteps.GENERAL_INFORMATION;
  totalSteps: number = AssetSeriesCreateSteps.METRICS;
  assetSeries: AssetSeries = new AssetSeries();
  mode: DialogType = DialogType.CREATE;
  attributesValid: boolean;
  metricsValid: boolean;

  AssetSeriesCreateSteps = AssetSeriesCreateSteps;

  constructor(private assetSeriesService: AssetSeriesService,
              private changeDetectorRef: ChangeDetectorRef,
              fieldService: FieldService,
              private dialogConfig: DynamicDialogConfig,
              private dynamicDialogRef: DynamicDialogRef,
  ) {
    fieldService.getItems().subscribe();
    this.companyId = dialogConfig.data.companyId;
    const assetSeriesId = this.dialogConfig.data.assetSeriesId;
    if (assetSeriesId) {
      this.mode = DialogType.EDIT;
    } else {
      this.mode = DialogType.CREATE;
    }

    if (this.mode === DialogType.EDIT) {
      this.assetSeriesService.getAssetSeries(this.companyId, assetSeriesId)
        .subscribe(assetSeries => this.assetSeries = assetSeries);
    }
  }

  ngOnInit() {
  }

  createAssetSeriesOfAssetTypeTemplate(assetTypeTemplateId: ID) {
    this.assetSeriesService.initDraftFromAssetTypeTemplate(this.companyId, assetTypeTemplateId)
          .subscribe(assetSeries => this.assetSeries = assetSeries);
  }

  nextStep() {
    if (this.step === this.totalSteps) {
      this.saveAssetSeries();
    } else {
      this.step++;
    }
  }

  back() {
    if (this.step === AssetSeriesCreateSteps.GENERAL_INFORMATION) {
      this.dynamicDialogRef.close();
    } else {
      this.step--;
    }
  }

  isReadyForNextStep(): boolean {
    let result = true;
    switch (this.step) {
      case AssetSeriesCreateSteps.GENERAL_INFORMATION:
        result = this.assetSeries?.name?.length && this.assetSeries?.name?.length !== 0;
        break;
      case AssetSeriesCreateSteps.CONNECTIVITY_SETTINGS:
        break;
      case AssetSeriesCreateSteps.ATTRIBUTES:
        result = this.attributesValid;
        break;
      case AssetSeriesCreateSteps.METRICS:
        result = this.metricsValid;
        break;
    }
    return result;
  }

  private saveAssetSeries() {
      if (this.assetSeries.id) {
        this.assetSeriesService.editItem(this.assetSeries.id, this.assetSeries).subscribe(
        () => this.dynamicDialogRef.close()
        );
      } else {
        this.assetSeriesService.createItem(this.assetSeries.companyId, this.assetSeries)
          .subscribe(() => this.dynamicDialogRef.close());
      }
  }

  setAttributesValid(isValid: boolean) {
    this.attributesValid = isValid;
    this.changeDetectorRef.detectChanges();
  }

  setMetricsValid(isValid: boolean) {
    this.metricsValid = isValid;
    this.changeDetectorRef.detectChanges();
  }
}
