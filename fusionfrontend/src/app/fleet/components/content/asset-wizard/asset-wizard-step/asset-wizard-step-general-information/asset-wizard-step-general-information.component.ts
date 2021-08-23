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
import { AssetSeries } from '../../../../../../store/asset-series/asset-series.model';
import { AssetSeriesQuery } from '../../../../../../store/asset-series/asset-series.query';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { AssetWizardStep } from '../asset-wizard-step.model';
import { Company } from '../../../../../../store/company/company.model';
import { AssetType } from '../../../../../../store/asset-type/asset-type.model';
import { WizardHelper } from '../../../../../../common/utils/wizard-helper';

@Component({
  selector: 'app-asset-wizard-step-general-information',
  templateUrl: './asset-wizard-step-general-information.component.html',
  styleUrls: ['./asset-wizard-step-general-information.component.scss']
})
export class AssetWizardStepGeneralInformationComponent implements OnInit {

  @Input() assetForm: FormGroup;
  @Input() relatedAssetSeries: AssetSeries;
  @Input() relatedAssetSeriesId: ID;
  @Input() relatedCompany: Company;
  @Input() relatedAssetType: AssetType;
  @Input() isAssetSeriesLocked: boolean;
  @Output() changeAssetSeries = new EventEmitter<ID>();
  @Output() stepChange = new EventEmitter<AssetWizardStep>();

  public assetSeries$: Observable<AssetSeries[]>;

  public MAX_TEXT_LENGTH = WizardHelper.MAX_TEXT_LENGTH;

  constructor(private assetSeriesQuery: AssetSeriesQuery,
              private wizardRef: DynamicDialogRef) { }

  ngOnInit(): void {
    this.assetSeries$ = this.assetSeriesQuery.selectAll();
    if (this.isAssetSeriesLocked) {
      this.assetForm.get('assetSeriesId')?.disable();
      this.assetForm.get('assetSeriesId').setValue(this.relatedAssetSeriesId);
    }
  }

  onChangeAssetSeries(assetSeriesId: ID): void {
    this.changeAssetSeries.emit(assetSeriesId);
  }

  isReadyForNextStep(): boolean {
    return this.assetForm.get('assetSeriesId').value != null
      && this.assetForm.get('name').value
      && this.assetForm.get('description').value;
  }

  onCancel(): void {
    this.wizardRef?.close();
  }

  onStart(): void {
    if (this.isReadyForNextStep()) {
      this.stepChange.emit(AssetWizardStep.GENERAL_INFORMATION + 1);
    }
  }
}
