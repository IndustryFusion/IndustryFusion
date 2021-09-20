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
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  RuleActionType,
  RulePrority,
  RuleResetType,
  RuleStatus,
  SynchronizationStatus
} from '../../../services/oisp.model';
import { EnumHelpers } from '../../../common/utils/enum-helpers';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { WizardHelper } from '../../../common/utils/wizard-helper';

@Component({
  selector: 'app-create-fusion-applet',
  templateUrl: './create-fusion-applet.component.html',
  styleUrls: ['./create-fusion-applet.component.scss']
})
export class CreateFusionAppletComponent implements OnInit {
  ruleForm: FormGroup;
  priorityOptions: string[];

  constructor(
    private formBuilder: FormBuilder,
    enumHelpers: EnumHelpers,
    private dynamicDialogRef: DynamicDialogRef,
  ) {
    this.priorityOptions = enumHelpers.getIterableArray(RulePrority);
    this.createRuleForm();
  }

  ngOnInit(): void {
  }

  dismissModal() {
    this.dynamicDialogRef.close();
  }

  confirmModal() {
    if (this.ruleForm.valid) {
      this.dynamicDialogRef.close(this.ruleForm.getRawValue());
    }
  }

  private createRuleForm(): void {
    const actionGroup = this.createActionGroup();
    const conditionsGroup = this.createConditionsGroup();

    this.ruleForm = this.formBuilder.group({
      id: [],
      name: ['', WizardHelper.requiredTextValidator],
      description: ['', [Validators.maxLength(1000)]],
      type: [null, []],
      resetType: [RuleResetType.Automatic, []],
      synchronizationStatus: [SynchronizationStatus.NotSync, [Validators.required]],
      priority: [null, Validators.required],
      actions: new FormArray([actionGroup]),
      conditions: conditionsGroup,
      status: [RuleStatus.Draft]
    });
  }

  private createActionGroup(): FormGroup {
    return this.formBuilder.group({
      type: [RuleActionType.mail],
      target: [[], []]
    });
  }

  private createConditionsGroup(): FormGroup {
    return this.formBuilder.group({
      operator: [],
      values: [[], []]
    });
  }
}
