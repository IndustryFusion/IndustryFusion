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
import { RuleAction, RuleActionType } from '../../../../services/oisp.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-applet-action-list',
  templateUrl: './applet-action-list.component.html',
  styleUrls: ['./applet-action-list.component.scss']
})
export class AppletActionListComponent implements OnInit {

  @Input()
  actions: RuleAction[] = [];
  actionsArray: FormArray = new FormArray([]);

  @Output()
  save = new EventEmitter<RuleAction[]>();

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.createActionGroups();
  }

  private createActionGroups() {
    this.actions.forEach(action => {
      const formGroup = this.createNewActionGroup();
      if (action.type === RuleActionType.http) {
        formGroup.addControl('http_headers', this.formBuilder.group(action.http_headers));
      }
      formGroup.setValue(action);
      this.actionsArray.push(formGroup);
    });
  }

  private createNewActionGroup(): FormGroup {
    return this.formBuilder.group({
      target: [[]],
      type: [, [Validators.required]],
    });
  }

  addAction() {
    this.actionsArray.push(this.createNewActionGroup());
  }

  removeAction(index: number) {
    this.actionsArray.removeAt(index);
  }

  saveAction() {
    if (this.actionsArray.valid) {
      this.save.emit(this.actionsArray.getRawValue());
    }
  }
}
