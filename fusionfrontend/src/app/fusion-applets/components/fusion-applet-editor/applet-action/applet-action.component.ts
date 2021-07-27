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
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RuleAction, RuleActionType } from '../../../../services/oisp.model';

@Component({
  selector: 'app-applet-action',
  templateUrl: './applet-action.component.html',
  styleUrls: ['./applet-action.component.scss']
})
export class AppletActionComponent implements OnInit {

  @Input()
  actions: RuleAction[] = [];

  actionsGroup: FormArray = new FormArray([]);
  actionMailGroup: FormGroup;
  activeAccordionIndex = 0;
  headers: FormGroup[] = [];
  activeHeaderGroup: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createMailGroup();
    this.activeHeaderGroup = this.getHeaderGroup();
  }


  private createMailGroup() {
    this.actionMailGroup = this.formBuilder.group({
      target: [[]],
      type: [RuleActionType.mail]
    });
    this.actionsGroup.push(this.actionMailGroup);
  }

  ngOnInit(): void {
    this.actionMailGroup.setValue(this.actions.find(action => action.type === RuleActionType.mail));
  }


  private getHeaderGroup(): FormGroup {
    return this.formBuilder.group({
      name: [, [Validators.required]],
      value: []
    });
  }

  addHeader() {
    this.headers.push(this.activeHeaderGroup);
    this.headers = this.headers.slice();
    this.activeHeaderGroup = this.getHeaderGroup();
  }

  removeHeader(headerIndex: number) {
    this.headers.splice(headerIndex, 1);
  }
}
