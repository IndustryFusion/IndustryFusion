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
import { Asset } from '../../../../../../core/store/asset/asset.model';
import { AssetWizardSharedMetricsComponent } from '../../asset-wizard-shared/asset-wizard-shared-metrics/asset-wizard-shared-metrics.component';

@Component({
  selector: 'app-asset-wizard-step-review',
  templateUrl: './asset-wizard-step-review.component.html',
  styleUrls: ['./asset-wizard-step-review.component.scss']
})
export class AssetWizardStepReviewComponent implements OnInit {

  @ViewChild(AssetWizardSharedMetricsComponent) metricsChild: AssetWizardSharedMetricsComponent;

  @Input() asset: Asset;
  @Output() stepChange = new EventEmitter<number>();

  constructor() {
  }

  ngOnInit(): void {
  }

  onBack(): void {
     this.stepChange.emit(AssetWizardStep.REVIEW - 1);
  }

  onNext(): void {
     this.stepChange.emit(AssetWizardStep.REVIEW + 1);
  }

  onBackToAttributes(): void {
    this.stepChange.emit(AssetWizardStep.ATTRIBUTES);
  }

  onBackToMetrics(): void {
    this.stepChange.emit(AssetWizardStep.METRICS_THRESHOLDS);
  }

  onBackToSubsystems(): void {
    this.stepChange.emit(AssetWizardStep.SUBSYSTEMS);
  }
}
