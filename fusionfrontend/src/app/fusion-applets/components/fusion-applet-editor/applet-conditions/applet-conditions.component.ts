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

import { Component, Input, OnInit } from '@angular/core';
import {
  ConditionsOperator,
  ConditionType,
  ConditionValueOperator, Device,
  RuleConditions
} from '../../../../services/oisp.model';
import { OispService } from '../../../../services/oisp.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-applet-conditions',
  templateUrl: './applet-conditions.component.html',
  styleUrls: ['./applet-conditions.component.scss']
})
export class AppletConditionsComponent implements OnInit {

  @Input()
  conditions: RuleConditions;

  @Input()
  ruleGroup: FormGroup;
  conditionsGroup: FormGroup;
  devices: Device[];

  constructor(private oispService: OispService,
              private formBuilder: FormBuilder) {
    this.loadDevices();
    this.createFormgroups();
  }

  ngOnInit(): void {
    if (!this.conditions.operator) {
      this.conditions.operator = ConditionsOperator.OR;
    }

    if (this.conditions.values?.length > 0) {
      this.conditions.values.forEach(() => {
        (this.conditionsGroup.get('values') as FormArray).push(this.createConditionValueGroup());
      });
    } else {
      this.createNewTrigger();
    }

    this.conditionsGroup.patchValue(this.conditions);
    this.ruleGroup.addControl('conditions', this.conditionsGroup);
  }

  private createFormgroups() {
    this.conditionsGroup = this.formBuilder.group({
      operator: [ConditionsOperator.OR, [Validators.required]],
      values: new FormArray([], [Validators.required, Validators.minLength(1)])
    });
  }

  private loadDevices() {
    this.oispService.getAllDevices()
      .subscribe(devices => {
        this.devices = devices;
      });
  }

  private createConditionValueGroup(): FormGroup {
    return this.formBuilder.group({
      component: this.formBuilder.group({
        name: [],
        dataType: [, Validators.required],
        cid: [],
      }, [Validators.required]),
      type: [ConditionType.basic, Validators.required],
      operator: [ConditionValueOperator['<'], Validators.required],
      values: new FormArray([
        new FormControl(null, [Validators.required, Validators.minLength(1)])
      ], [Validators.required, Validators.minLength(1)]),
      timeLimit: [],
      baselineCalculationLevel: [],
      baselineSecondsBack: [],
      baselineMinimalInstances: [],
    });
  }

  getConditonValues(): FormArray {
    return (this.conditionsGroup.get('values') as FormArray);
  }

  createNewTrigger() {
    (this.conditionsGroup.get('values') as FormArray).push(this.createConditionValueGroup());
  }
}
