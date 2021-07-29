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
import {
  ConditionValueOperator,
  ConditionType,
  Device,
  displayConstionType,
  Rule,
  RuleAction,
  RuleResetType,
} from '../../../services/oisp.model';
import { RuleStatusUtil } from '../../util/rule-status-util';
import { EnumHelpers } from '../../../common/utils/enum-helpers';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-fusion-applet-editor',
  templateUrl: './fusion-applet-editor.component.html',
  styleUrls: ['./fusion-applet-editor.component.scss']
})
export class FusionAppletEditorComponent implements OnInit {
  rule: Rule;
  RuleResetType = RuleResetType;
  ConditionType = ConditionType;

  assets: any[];
  selectedDevice: Device[] = [];
  devices: Device[] = [];
  contitionTypeDropdownValue: SelectItem[];
  conditionOperatorDropdownValue: SelectItem[];
  activeAccordionIndex = 0;
  conditionType: ConditionType;
  conditionTimeDropdownValue: SelectItem[];

  constructor(
    activatedRoute: ActivatedRoute,
    private oispService: OispService,
    public ruleStatusUtil: RuleStatusUtil,
    private enumHelpers: EnumHelpers
  ) {
    this.contitionTypeDropdownValue = this.getConditionTypeDropdownValue();
    this.conditionOperatorDropdownValue = this.getConditionOperaterDropdownValue();
    this.conditionTimeDropdownValue = this.getConditionTimeDropValue();
    const fusionAppletId = activatedRoute.snapshot.parent.paramMap.get('fusionAppletId');
    this.oispService.getRule(fusionAppletId).subscribe(rule => this.rule = rule);

    this.oispService.getAllDevices()
      .subscribe( devices => this.devices = devices);
  }

  ngOnInit(): void {
  }

  changeStatus($event: boolean) {
    console.log($event);
  }

  mapDeviceToComponent(devices: Device[]): SelectItem[] {
    return devices.map(device => device.components.map(component => {
      return {
        label: device.name + ': ' + component.name + '(' + component.componentType.dataType + ')',
        value: component
      };
    }))
      .reduce((acc, val) => acc.concat(val), []);
  }

  getConditionTypeDropdownValue(): SelectItem[] {
    const result = [];

    for (const element of this.enumHelpers.getIterableArray(ConditionType)) {
      result.push({
        label: displayConstionType(element),
        value: element
      });
    }
    return result;
  }

  getConditionOperaterDropdownValue(): SelectItem[] {
    const result = [];

    for (const element of this.enumHelpers.getIterableArray(ConditionValueOperator)) {
      result.push({
        label: element,
        value: element
      });
    }
    return result;
  }

  private getConditionTimeDropValue() {
    return [{
      label: 'Weeks',
      value: 'weeks'
    }, {
      label: 'Days',
      value: 'days'
    }, {
      label: 'Hours',
      value: 'hours'
    }, {
        label: 'Minutes',
        value: 'minutes'
      }, {
        label: 'Seconds',
        value: 'seconds'
      }];
  }

  saveActions(actions: RuleAction[]) {
    this.rule.actions = actions;
/*    this.rule.type = RuleType.Regular;
    this.rule.conditions.operator = 'AND';
    this.rule.conditions.values = ['42'];
    this.oispService.setRuleStatus(this.rule.id, RuleStatus.OnHold).subscribe(rule => this.rule = rule);*/
    this.oispService.updateRule(this.rule.id, this.rule).subscribe(rule => this.rule = rule);
  }
}
