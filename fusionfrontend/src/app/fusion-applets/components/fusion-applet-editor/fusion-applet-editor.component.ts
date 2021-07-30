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
import { ActivatedRoute } from '@angular/router';
import { OispService } from '../../../services/oisp.service';
import { Rule, RuleAction, RuleResetType, } from '../../../services/oisp.model';
import { RuleStatusUtil } from '../../util/rule-status-util';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-fusion-applet-editor',
  templateUrl: './fusion-applet-editor.component.html',
  styleUrls: ['./fusion-applet-editor.component.scss']
})
export class FusionAppletEditorComponent implements OnInit {
  RuleResetType = RuleResetType;

  rule: Rule;
  ruleGroup: FormGroup;
  assets: any[];

  constructor(
    activatedRoute: ActivatedRoute,
    private oispService: OispService,
    public ruleStatusUtil: RuleStatusUtil,
    formBuilder: FormBuilder
  ) {
    this.ruleGroup = formBuilder.group({ });
    const fusionAppletId = activatedRoute.snapshot.parent.paramMap.get('fusionAppletId');
    this.oispService.getRule(fusionAppletId).subscribe(rule => this.rule = rule);
  }

  ngOnInit(): void {
  }

  changeStatus($event: boolean) {
    console.log($event);
  }

  saveActions(actions: RuleAction[]) {
    this.rule.actions = actions;
    this.oispService.updateRule(this.rule.id, this.rule).subscribe(rule => this.rule = rule);
  }

  setResetTypeAutomatic(isAutomatic: boolean) {
    if (isAutomatic) {
      this.rule.resetType = RuleResetType.Automatic;
    } else {
      this.rule.resetType = RuleResetType.Manual;
    }
  }

  save() {
    this.rule.conditions = this.ruleGroup.get('conditions').value;
    this.oispService.updateRule(this.rule.id, this.rule).subscribe(rule => this.rule = rule);
  }
}
