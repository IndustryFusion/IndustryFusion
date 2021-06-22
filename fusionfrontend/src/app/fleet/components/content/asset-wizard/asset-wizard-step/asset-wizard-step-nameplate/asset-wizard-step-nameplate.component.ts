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
import { AssetWizardStep } from '../asset-wizard-step.model';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-asset-wizard-step-nameplate',
  templateUrl: './asset-wizard-step-nameplate.component.html',
  styleUrls: ['./asset-wizard-step-nameplate.component.scss']
})
export class AssetWizardStepNameplateComponent implements OnInit {

  @Input() assetForm: FormGroup;
  @Output() stepChange = new EventEmitter<number>();

  public protectionClasses: SelectItem[];
  public yearRange: string;

  constructor() { }

  ngOnInit(): void {
    this.yearRange = `${ new Date().getFullYear() - 8 }:${ new Date().getFullYear() + 2}`;
    this.protectionClasses = [
      { label: 'IP20', value: 'IP20' },
      { label: 'IP21', value: 'IP21' },
      { label: 'IP23', value: 'IP23' },
      { label: 'IP40', value: 'IP40' },
      { label: 'IP43', value: 'IP43' },
      { label: 'IP44', value: 'IP44' },
      { label: 'IP50', value: 'IP50' },
      { label: 'IP54', value: 'IP54' },
      { label: 'IP55', value: 'IP55' },
      { label: 'IP56', value: 'IP56' },
      { label: 'IP65', value: 'IP65' },
      { label: 'IP67', value: 'IP67' },
      { label: 'IP68', value: 'IP68' },
    ];
  }

  onBack() {
    this.stepChange.emit(AssetWizardStep.DIGITAL_NAMEPLATE - 1);
  }

  onNext() {
    this.stepChange.emit(AssetWizardStep.DIGITAL_NAMEPLATE + 1);
  }
}
