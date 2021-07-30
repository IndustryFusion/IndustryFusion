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
  ConditionType, ConditionValueComponent,
  ConditionValueOperator,
  Device, DeviceComponent,
  displayConstionType,
  RuleConditions
} from '../../../../services/oisp.model';
import { SelectItem } from 'primeng/api';
import { EnumHelpers } from '../../../../common/utils/enum-helpers';
import { OispService } from '../../../../services/oisp.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-applet-conditions',
  templateUrl: './applet-conditions.component.html',
  styleUrls: ['./applet-conditions.component.scss']
})
export class AppletConditionsComponent implements OnInit {

  ConditionType = ConditionType;

  @Input()
  conditions: RuleConditions;
  activeAccordionIndex = 0;
  contitionTypeDropdownValue: SelectItem[];
  conditionOperatorDropdownValue: SelectItem[];

  conditionTimeDropdownValue: SelectItem[];
  selectedDevice: Device[] = [];
  devices: Device[] = [];
  conditionType: ConditionType;

  @Input()
  ruleGroup: FormGroup;
  conditionsGroup: FormGroup;
  conditionValueGroup: FormGroup;


  constructor(private enumHelpers: EnumHelpers,
              private oispService: OispService,
              private formBuilder: FormBuilder) {
    this.setupDropdowns();
    this.loadDevices();
    this.createFormgroups();
  }

  ngOnInit(): void {
    this.prefillSelectedDevices();
    if (!this.conditions.operator) {
      this.conditions.operator = ConditionsOperator.OR;
    }
    this.conditionsGroup.patchValue(this.conditions);
    this.ruleGroup.addControl('conditions', this.conditionsGroup);
  }

  private createFormgroups() {
    this.conditionsGroup = this.formBuilder.group({
      operator: [ConditionsOperator.OR, [Validators.required]],
      values: new FormArray([], [Validators.required, Validators.minLength(1)])
    });

    this.conditionValueGroup = this.createConditionValueGroup();
    (this.conditionsGroup.get('values') as FormArray)?.push(this.conditionValueGroup);
  }

  private loadDevices() {
    this.oispService.getAllDevices()
      .subscribe(devices => {
        this.devices = devices;
        this.prefillSelectedDevices();
      });
  }



  private setupDropdowns() {
    this.contitionTypeDropdownValue = this.getConditionTypeDropdownValue();
    this.conditionOperatorDropdownValue = this.getConditionOperaterDropdownValue();
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



  private prefillSelectedDevices() {
    if (this.conditions && this.devices) {
      this.selectedDevice = this.conditions.values
        .map(value => value.component.cid)
        .map(cid => this.devices.find(device => device.components.find(deviceComponent => deviceComponent.cid === cid)))
        .filter(device => device);
    }
  }

  mapDeviceToComponent(devices: Device[]): SelectItem[] {
    const cid = this.conditionValueGroup.get('component.cid')?.value;
    const result: SelectItem<ConditionValueComponent>[] = devices
      .map(device => device.components
        .map<SelectItem<ConditionValueComponent>>(component => {
          return this.mapDeviceComponentToSelectItem(device, component);
        }))
      .reduce((acc, val) => acc.concat(val), []);

    if (cid) {
      const deviceComponent = this.devices
        .map(device => ({ device, component: device.components.find(component => component.cid === cid)}))
        .find(component => component);
      if (deviceComponent && result.find(selectItem => selectItem.value.cid === cid) === undefined) {
        result.push(this.mapDeviceComponentToSelectItem(deviceComponent.device, deviceComponent.component));
      }
    }
    return result;
  }

  mapDeviceComponentToSelectItem(device: Device, component: DeviceComponent): SelectItem<ConditionValueComponent> {
    return {
      label: device.name + ': ' + component.name + '(' + component.componentType?.dataType + ')',
      value: {
        name: component.name,
        dataType: component.componentType?.dataType,
        cid: component.cid
      }
    };
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

  updateComponent(component: ConditionValueComponent) {
    this.conditionValueGroup.get('component').patchValue(component);
  }
}
