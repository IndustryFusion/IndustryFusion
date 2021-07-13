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

import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AssetWizardStep } from '../asset-wizard-step.model';
import { Asset } from '../../../../../../store/asset/asset.model';
import { AssetWizardFieldInstanceMetricsComponent } from '../../asset-wizard-field-instance-metrics/asset-wizard-field-instance-metrics.component';

@Component({
  selector: 'app-asset-wizard-step-overview',
  templateUrl: './asset-wizard-step-overview.component.html',
  styleUrls: ['./asset-wizard-step-overview.component.scss']
})
export class AssetWizardStepOverviewComponent implements OnInit {

  @ViewChild(AssetWizardFieldInstanceMetricsComponent) metricsChild: AssetWizardFieldInstanceMetricsComponent;

  @Input() asset: Asset;
  @Output() valid = new EventEmitter<boolean>();
  @Output() stepChange = new EventEmitter<number>();

  constructor() {
  }

  ngOnInit(): void {
  }

  onBack() {
     this.stepChange.emit(AssetWizardStep.OVERVIEW - 1);
  }

  onNext() {
     this.stepChange.emit(AssetWizardStep.OVERVIEW + 1);
  }

  onBackToAttributes() {
    this.stepChange.emit(AssetWizardStep.ATTRIBUTES);
  }

  onBackToMetrics() {
    this.stepChange.emit(AssetWizardStep.METRICS_THRESHOLDS);
  }
}
