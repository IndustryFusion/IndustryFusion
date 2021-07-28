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
import { RuleAction, RuleActionType } from '../../../../services/oisp.model';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-applet-action-list',
  templateUrl: './applet-action-list.component.html',
  styleUrls: ['./applet-action-list.component.scss']
})
export class AppletActionListComponent implements OnInit {

  @Input()
  actions: RuleAction[] = [];
  actionsArray: FormArray = new FormArray([]);

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.createMailGroup().setValue(this.actions.find(action => action.type === RuleActionType.mail));
    this.actions.filter(action => action.type === RuleActionType.http).forEach(action => {
      action.http_headers = new Map<string, string>(Object.entries(action.http_headers));
      this.createWebhookGroup().setValue(action);
    });
  }

  private createMailGroup(): FormGroup {
    const formGroup = this.createActionGroup();
    formGroup.get('type').setValue(RuleActionType.mail);
    this.actionsArray.push(formGroup);
    return formGroup;
  }

  private createWebhookGroup(): FormGroup {
    const formGroup = this.createActionGroup();
    formGroup.get('type').setValue(RuleActionType.http);
    formGroup.addControl('http_headers', new FormControl(new Map<string, string>()));
    this.actionsArray.push(formGroup);
    return formGroup;
  }

  private createActionGroup(): FormGroup {
    return this.formBuilder.group({
      target: [[]],
      type: [, [Validators.required]],
    });
  }

  addAction() {
    this.actionsArray.push(this.createActionGroup());
  }

  removeAction(index: number) {
    this.actionsArray.removeAt(index);
  }
}
