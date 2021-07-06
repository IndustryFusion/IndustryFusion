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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { FieldInstance } from '../../../../../../store/field-instance/field-instance.model';
import { FieldInstanceQuery } from '../../../../../../store/field-instance/field-instance.query';
import { FieldType } from '../../../../../../store/field-target/field-target.model';
import { FieldQuery } from '../../../../../../store/field/field-query.service';
import { Asset } from '../../../../../../store/asset/asset.model';
import { ThresholdType } from '../../../../../../store/threshold/threshold.model';
import { AssetWizardStep } from '../asset-wizard-step.model';

@Component({
  selector: 'app-asset-wizard-step-metrics-thresholds',
  templateUrl: './asset-wizard-step-metrics-thresholds.component.html',
  styleUrls: ['./asset-wizard-step-metrics-thresholds.component.scss']
})
export class AssetWizardStepMetricsThresholdsComponent implements OnInit {

  @Input() asset: Asset;
  @Output() valid = new EventEmitter<boolean>();
  @Output() stepChange = new EventEmitter<number>();

  ThresholdType = ThresholdType;

  fieldInstancesFormArray: FormArray;
  $loading: Observable<boolean>;

  constructor(private fieldInstanceQuery: FieldInstanceQuery,
              private fieldQuery: FieldQuery,
              private formBuilder: FormBuilder) {
    this.$loading = this.fieldInstanceQuery.selectLoading();
  }

  ngOnInit(): void {
    this.fillTable(this.asset.fieldInstances);
  }

  private createFieldInstanceGroup(index: number, fieldInstance: FieldInstance): FormGroup {
    const group = this.formBuilder.group({
      id: [],
      index: [],
      name: [],
      fieldName: [],
      sourceRegister: [],
      sourceUnitName: [],
      accuracy: [],
      mandatory: [],
      thresholds: this.createThresholdGroup(fieldInstance),
      saved: [true, Validators.requiredTrue],
    });

    const field = this.fieldQuery.getEntity(fieldInstance.fieldSource?.fieldTarget?.fieldId);

    group.get('id').patchValue(fieldInstance.id);
    group.get('index').patchValue(index);
    group.get('name').patchValue(fieldInstance.name);
    group.get('fieldName').patchValue(field?.name);
    group.get('sourceRegister').patchValue(fieldInstance.fieldSource?.register);
    group.get('sourceUnitName').patchValue(fieldInstance.fieldSource?.sourceUnit?.name);
    group.get('accuracy').patchValue(field?.accuracy);
    group.get('mandatory').patchValue(fieldInstance.fieldSource?.fieldTarget.mandatory);

    return group;
  }

  private createThresholdGroup(fieldInstance: FieldInstance): FormGroup {
    const thresholdGroup = this.formBuilder.group({
      absoluteLower: [],
      absoluteUpper: [],
      idealLower: [],
      idealUpper: [],
      criticalLower: [],
      criticalUpper: [],
    });

    if (fieldInstance.absoluteThreshold) {
      thresholdGroup.get('absoluteLower').patchValue(fieldInstance.absoluteThreshold.valueLower);
      thresholdGroup.get('absoluteUpper').patchValue(fieldInstance.absoluteThreshold.valueUpper);
    }
    if (fieldInstance.idealThreshold) {
      thresholdGroup.get('idealLower').patchValue(fieldInstance.idealThreshold.valueLower);
      thresholdGroup.get('idealUpper').patchValue(fieldInstance.idealThreshold.valueUpper);
    }
    if (fieldInstance.criticalThreshold) {
      thresholdGroup.get('criticalLower').patchValue(fieldInstance.criticalThreshold.valueLower);
      thresholdGroup.get('criticalUpper').patchValue(fieldInstance.criticalThreshold.valueUpper);
    }

    return thresholdGroup;
  }

  removeValue(group: AbstractControl) {
    group.get('value').setValue(null);
    this.saveValue(group);
  }

  saveValue(group: AbstractControl) {
/*
    let fieldInstance = this.fieldInstances.find(instance => instance.id === group.get('id').value);
    fieldInstance = { ...fieldInstance};
    fieldInstance.value = group.get('value').value;
    this.fieldInstanceService.editItem(this.asset.companyId, fieldInstance).subscribe();
    group.get('saved').patchValue(true);

*/
    const fieldInstance: FieldInstance = this.asset.fieldInstances[group.get('index').value] as FieldInstance;
    fieldInstance.value = group.get('value').value;
    this.asset.fieldInstances[group.get('index').value] = fieldInstance;
    group.get('saved').patchValue(true);
  }

  private fillTable(fieldInstances: FieldInstance[]) {
    this.fieldInstancesFormArray = new FormArray([]);
    this.valid.emit(this.fieldInstancesFormArray.valid);
    this.fieldInstancesFormArray.valueChanges.subscribe(() => this.valid.emit(this.fieldInstancesFormArray.valid));

    for (let i = 0; i < fieldInstances.length; i++) {
      if (fieldInstances[i].fieldSource.fieldTarget.fieldType === FieldType.METRIC) {
        const formGroup = this.createFieldInstanceGroup(i, fieldInstances[i]);
        this.fieldInstancesFormArray.push(formGroup);
      }
    }

    console.log('fieldInstancesFormArray:', this.fieldInstancesFormArray);
  }

  isEditMode(group: AbstractControl): boolean {
    return !group.get('saved').value;
  }

  getTypeTitle(type: ThresholdType) {
    switch (type) {
      case ThresholdType.ABSOLUTE:
        return 'Absolute lower & upper limit *';
      case ThresholdType.IDEAL:
        return 'Ideal range (optional)';
      case ThresholdType.CRITICAL:
        return 'Critical alert range (optional)';
    }
  }

  getLowerLimitTitle(type: ThresholdType) {
    switch (type) {
      case ThresholdType.ABSOLUTE:
        return 'Absolute lower limit';
      case ThresholdType.IDEAL:
        return 'Lower ideal threshold';
      case ThresholdType.CRITICAL:
        return 'Lower critical alert threshold';
    }
  }

  getUpperLimitTitle(type: ThresholdType) {
    switch (type) {
      case ThresholdType.ABSOLUTE:
        return 'Absolute upper limit';
      case ThresholdType.IDEAL:
        return 'Upper ideal threshold';
      case ThresholdType.CRITICAL:
        return 'Upper critical alert threshold';
    }
  }
}
