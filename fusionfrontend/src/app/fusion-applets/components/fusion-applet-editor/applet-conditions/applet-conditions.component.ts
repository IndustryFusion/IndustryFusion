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
  BaselineCalculationLevel,
  ConditionsOperator,
  ConditionType,
  ConditionValueOperator,
  Rule,
} from 'src/app/core/store/oisp/oisp-rule/oisp-rule.model';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ItemOptionsMenuType } from '../../../../shared/components/ui/item-options-menu/item-options-menu.type';
import { SelectItem } from 'primeng/api';
import { EnumHelpers } from '../../../../core/helpers/enum-helpers';
import { Device } from '../../../../core/store/oisp/oisp-device/oisp-device.model';

@Component({
  selector: 'app-applet-conditions',
  templateUrl: './applet-conditions.component.html',
  styleUrls: ['./applet-conditions.component.scss']
})
export class AppletConditionsComponent implements OnInit {
  ItemOptionsMenuType = ItemOptionsMenuType;

  @Input()
  rule: Rule;

  @Input()
  ruleGroup: FormGroup;
  conditionsGroup: FormGroup;
  @Input()
  devices: Device[];
  dropdownOperatorOptions: SelectItem[];

  constructor(private formBuilder: FormBuilder,
              private enumHelpers: EnumHelpers) {
    this.dropdownOperatorOptions = this.getOperatorDropdownValue();
    this.createFormgroups();
  }

  ngOnInit(): void {
    if (!this.rule.conditions.operator) {
      this.rule.conditions.operator = ConditionsOperator.OR;
    }

    if (this.rule.conditions.values?.length > 0) {
      this.rule.conditions.values.forEach((conditionValue) => {
        (this.conditionsGroup.get('values') as FormArray).push(this.createConditionValueGroup(conditionValue.values?.length));
      });
    } else {
      this.createNewTrigger();
    }

    this.conditionsGroup.patchValue(this.rule.conditions);
    this.ruleGroup.addControl('conditions', this.conditionsGroup);
  }

  private createFormgroups() {
    this.conditionsGroup = this.formBuilder.group({
      operator: [ConditionsOperator.OR, [Validators.required]],
      values: new FormArray([], [Validators.required, Validators.minLength(1)])
    });
    this.conditionsGroup.get('operator').valueChanges.subscribe(value => {
      this.conditionsGroup.get('operator').setValue(value, { emitEvent: false});
    });
  }

  private createConditionValueGroup(valuesCount?: number | undefined): FormGroup {
    const formGroup = this.formBuilder.group({
      component: this.formBuilder.group({
        name: [],
        dataType: [, Validators.required],
        cid: [],
      }, { validators: [Validators.required]}),
      type: [ConditionType.basic, Validators.required],
      operator: [ConditionValueOperator['<'], Validators.required],
      values: new FormArray([], [Validators.required, Validators.minLength(1)]),
      timeLimit: [],
      baselineCalculationLevel: [BaselineCalculationLevel['Device level']],
      baselineSecondsBack: [],
      baselineMinimalInstances: [],
    });
    if (!valuesCount) {
      valuesCount = 1;
    }
    valuesCount++;
    while ((formGroup.get('values') as FormArray).length !== valuesCount) {
      (formGroup.get('values') as FormArray).push(new FormControl(null, [Validators.required, Validators.minLength(1)]));
    }

    formGroup.get('type').valueChanges.subscribe((value: ConditionType) => {
      this.updateValidationOnType(formGroup, value);
    });
    this.updateValidationOnType(formGroup, ConditionType.basic);
    return formGroup;
  }

  private updateValidationOnType(formGroup: FormGroup, value: ConditionType) {
    const groups: AbstractControl[] = [
      formGroup.get('timeLimit'),
      formGroup.get('values'),
      formGroup.get('baselineCalculationLevel'),
      formGroup.get('baselineSecondsBack'),
      formGroup.get('baselineMinimalInstances')
    ];
    groups.forEach(control => control.clearValidators());
    switch (value) {
      case ConditionType.basic:
        formGroup.get('values').setValidators([Validators.required, Validators.minLength(1)]);
        (formGroup.get('values') as FormArray).removeAt(1);
        break;
      case ConditionType.statistics:
        formGroup.get('baselineSecondsBack').setValidators([Validators.required, Validators.min(1)]);
        formGroup.get('baselineMinimalInstances').setValidators([Validators.required, Validators.min(1)]);
        formGroup.get('values').setValidators([Validators.required, Validators.minLength(2)]);
        break;
      case ConditionType.time:
        formGroup.get('timeLimit').setValidators([Validators.required, Validators.min(1)]);
        formGroup.get('values').setValidators([Validators.required, Validators.minLength(1)]);
        (formGroup.get('values') as FormArray).removeAt(1);
        break;
    }
    groups.forEach(control => control.updateValueAndValidity());
  }

  getConditonValues(): FormArray {
    return (this.conditionsGroup.get('values') as FormArray);
  }

  createNewTrigger() {
    (this.conditionsGroup.get('values') as FormArray).push(this.createConditionValueGroup());
  }

  removeAction(index: number) {
    this.getConditonValues().removeAt(index);
  }

  getOperatorDropdownValue(): SelectItem[] {
    const result = [];

    for (const element of this.enumHelpers.getIterableArray(ConditionsOperator)) {
      result.push({
        label: element,
        value: element
      });
    }
    return result;
  }
}
