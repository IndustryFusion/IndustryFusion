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

import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RuleAction, RuleActionType } from '../../../../../services/oisp.model';

@Component({
  selector: 'app-applet-action',
  templateUrl: './applet-action.component.html',
  styleUrls: ['./applet-action.component.scss']
})
export class AppletActionComponent implements OnInit {
  RuleActionType = RuleActionType;

  @Input()
  actionGroup: FormGroup;

  @Output()
  saveAction = new EventEmitter<RuleAction>();


  constructor() {
  }

  ngOnInit(): void {
  }

  showActionTypePanel(type: RuleActionType): boolean {
    const actualType = this.actionGroup.get('type').value;
    return !actualType || actualType === type;
  }

  isActionType(type: RuleActionType): boolean {
    const actualType = this.actionGroup.get('type').value;
    return actualType === type;
  }

  setActionType(type: RuleActionType) {
    if (!this.actionGroup.get('type').value) {
      this.actionGroup.get('type').setValue(type);
    }
  }

  saveThisAction(action: RuleAction) {
    this.saveAction.emit(action);
  }
}
