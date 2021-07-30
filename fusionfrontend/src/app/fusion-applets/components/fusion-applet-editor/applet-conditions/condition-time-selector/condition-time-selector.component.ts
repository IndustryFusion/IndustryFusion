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
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-condition-time-selector',
  templateUrl: './condition-time-selector.component.html',
  styleUrls: ['./condition-time-selector.component.scss']
})
export class ConditionTimeSelectorComponent implements OnInit {

  private readonly SECOND = 1;
  private readonly MINUTE = 60 * this.SECOND;
  private readonly HOUR = 60 * this.MINUTE;
  private readonly DAY = 24 * this.HOUR;
  private readonly WEEK = 7 * this.DAY;
  private readonly TIME_OPERATORS = [this.SECOND, this.MINUTE, this.HOUR, this.DAY, this.WEEK];

  conditionTimeDropdownValue: SelectItem[];
  timeGroup: FormGroup;

  @Input()
  timeLimit: FormControl;

  constructor(private formBuilder: FormBuilder) {
    this.conditionTimeDropdownValue = this.getConditionTimeDropValue();
    this.timeGroup = this.formBuilder.group({
      timeOperator: [1, [Validators.required]],
      value: [, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.timeLimit.valueChanges.subscribe(value => {
      this.updateTimeGroup(value);
    });
    this.timeGroup.valueChanges.subscribe((time: { timeOperator: number, value: number }) =>
      this.timeLimit.patchValue(time.value * time.timeOperator, { emitEvent: false}));
    if (this.timeLimit?.value) {
      this.updateTimeGroup(this.timeLimit.value);
    }
  }

  private updateTimeGroup(value) {
    let timeOperator: number;
    for (const item of this.TIME_OPERATORS) {
      console.log(value + ' % ' + item, value % item);
      if (value % item === 0) {
        timeOperator = item;
      }
    }
    console.log(timeOperator, value / timeOperator);
    this.timeGroup.patchValue({ timeOperator, value: value / timeOperator});
  }

  private getConditionTimeDropValue() {
    return [{
      label: 'Weeks',
      value: this.WEEK
    }, {
      label: 'Days',
      value: this.DAY
    }, {
      label: 'Hours',
      value: this.HOUR
    }, {
      label: 'Minutes',
      value: this.MINUTE
    }, {
      label: 'Seconds',
      value: this.SECOND
    }];
  }
}
