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
import { AssetWizardFieldInstanceAttributesComponent } from '../../asset-wizard-field-instance-attributes/asset-wizard-field-instance-attributes.component';

@Component({
  selector: 'app-asset-wizard-step-attributes',
  templateUrl: './asset-wizard-step-attributes.component.html',
  styleUrls: ['./asset-wizard-step-attributes.component.scss']
})
export class AssetWizardStepAttributesComponent implements OnInit {

  @ViewChild(AssetWizardFieldInstanceAttributesComponent) attributesChild: AssetWizardFieldInstanceAttributesComponent;

  @Input() asset: Asset;
  @Output() valid = new EventEmitter<boolean>();
  @Output() stepChange = new EventEmitter<number>();

  public isReadyForNextStep = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  public onBack(): void {
    if (this.isReadyForNextStep) {
      this.stepChange.emit(AssetWizardStep.ATTRIBUTES - 1);
    }
  }

  public onNext(): void {
    if (this.isReadyForNextStep) {
      this.attributesChild.saveValues();
      this.stepChange.emit(AssetWizardStep.ATTRIBUTES + 1);
    }
  }

  public onSetValid(isValid: boolean): void {
    this.isReadyForNextStep = isValid;
    this.valid.emit(isValid);
  }

}
