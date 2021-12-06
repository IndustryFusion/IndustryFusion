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
import { ProtectionClassService } from '../../../../../../core/services/api/protection-class.service';

@Component({
  selector: 'app-asset-wizard-step-nameplate',
  templateUrl: './asset-wizard-step-nameplate.component.html',
  styleUrls: ['./asset-wizard-step-nameplate.component.scss']
})
export class AssetWizardStepNameplateComponent implements OnInit {

  @Input() assetForm: FormGroup;
  @Output() stepChange = new EventEmitter<number>();

  public protectionClasses: SelectItem[] = [];
  public yearRange: string;

  constructor(private protectionClassService: ProtectionClassService) { }

  ngOnInit(): void {
    this.yearRange = `${ new Date().getFullYear() - 8 }:${ new Date().getFullYear() + 2}`;
    this.protectionClassService.getProtectionClasses().subscribe(protectionClasses => {
      protectionClasses.forEach(protectionClass => {
        this.protectionClasses.push({ label: protectionClass.toString(), value: protectionClass.toString() });
        this.assetForm.get('protectionClass').setValue(this.assetForm.get('protectionClass')?.value);
      });
    });
  }

  isReadyForNextStep(): boolean {
    return this.assetForm.valid;
  }

  onBack(): void {
    this.stepChange.emit(AssetWizardStep.DIGITAL_NAMEPLATE - 1);
  }

  onNext(): void {
    if (this.isReadyForNextStep()) {
      this.stepChange.emit(AssetWizardStep.DIGITAL_NAMEPLATE + 1);
    }
  }
}
