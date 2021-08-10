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
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Threshold, ThresholdType } from '../../../../../../store/threshold/threshold.model';
import { FieldInstance } from '../../../../../../store/field-instance/field-instance.model';
import { CustomFormValidators } from '../../../../../../common/utils/custom-form-validators';
import { QuantityDataType } from 'src/app/store/field-details/field-details.model';
import { FieldThresholdType } from 'src/app/store/field/field.model';
import { Asset } from '../../../../../../store/asset/asset.model';
import { FieldType } from '../../../../../../store/field-target/field-target.model';
import { FieldQuery } from '../../../../../../store/field/field-query.service';
import { QuantityTypeQuery } from '../../../../../../store/quantity-type/quantity-type.query';

@Component({
  selector: 'app-asset-wizard-shared-metrics',
  templateUrl: './asset-wizard-shared-metrics.component.html',
  styleUrls: ['./asset-wizard-shared-metrics.component.scss']
})
export class AssetWizardSharedMetricsComponent implements OnInit {

  @Input() asset: Asset;
  @Input() isReview = false;
  @Output() changeIsValid = new EventEmitter<boolean>();
  @Output() backToEditPage = new EventEmitter<void>();

  ThresholdType = ThresholdType;
  QuantityDataType = QuantityDataType;
  FieldThresholdType = FieldThresholdType;
  fieldInstancesFormArray: FormArray;

  private static getThresholdFromForm(thresholdGroup: AbstractControl,
                                      type: ThresholdType,
                                      quantityDataType: QuantityDataType): Threshold {

    const lowerValue = thresholdGroup.get(type + 'Lower').value;
    const upperValue = thresholdGroup.get(type + 'Upper').value;
    const hasValue: boolean = lowerValue || upperValue;
    const isNumeric: boolean = quantityDataType === QuantityDataType.NUMERIC;

    // As demoinsert data also have thresholds for non numeric data, force to remove them before saving
    if (!isNumeric || !hasValue) {
      return null;
    }

    const threshold: Threshold = new Threshold();
    threshold.id = thresholdGroup.get('id').value;
    threshold.valueUpper = upperValue;
    threshold.valueLower = lowerValue;
    return threshold;
  }

  constructor(private formBuilder: FormBuilder,
              private fieldQuery: FieldQuery,
              private quantityTypeQuery: QuantityTypeQuery) {
  }

  ngOnInit(): void {
    this.fillTable(this.asset.fieldInstances);
  }

  private fillTable(fieldInstances: FieldInstance[]) {
    this.fieldInstancesFormArray = new FormArray([]);
    this.fieldInstancesFormArray.valueChanges.subscribe(() => this.changeIsValid.emit(this.fieldInstancesFormArray.valid));

    for (let i = 0; i < fieldInstances.length; i++) {
      if (fieldInstances[i].fieldSource.fieldTarget.fieldType === FieldType.METRIC) {
        const formGroup = this.createFieldInstanceGroup(i, this.fieldInstancesFormArray.length, fieldInstances[i]);
        this.fieldInstancesFormArray.push(formGroup);
      }
    }
    this.changeIsValid.emit(this.fieldInstancesFormArray.valid);
  }

  private createFieldInstanceGroup(indexFieldInstances: number, indexInArray: number,
                                   fieldInstance: FieldInstance): FormGroup {
    const group = this.formBuilder.group({
      id: [],
      indexFieldInstances: [],
      indexInArray: [],
      name: [],
      fieldName: [],
      sourceRegister: [],
      sourceUnitName: [],
      accuracy: [],
      mandatory: [],
      fieldThresholdType: [],
      quantityDataType: [],
      thresholds: this.createThresholdGroup(fieldInstance),
      valid: [true, Validators.requiredTrue],
    });

    const field = this.fieldQuery.getEntity(fieldInstance.fieldSource.fieldTarget.fieldId);
    const quantityType = this.quantityTypeQuery.getEntity(fieldInstance.fieldSource.sourceUnit.quantityTypeId);
    const quantityDataType = quantityType.dataType;

    group.get('id').patchValue(fieldInstance.id);
    group.get('indexFieldInstances').patchValue(indexFieldInstances);
    group.get('indexInArray').patchValue(indexInArray);
    group.get('name').patchValue(fieldInstance.name);
    group.get('fieldName').patchValue(field.name);
    group.get('sourceRegister').patchValue(fieldInstance.fieldSource.register);
    group.get('sourceUnitName').patchValue(fieldInstance.fieldSource.sourceUnit.name);
    group.get('accuracy').patchValue(field.accuracy);
    group.get('mandatory').patchValue(fieldInstance.fieldSource.fieldTarget.mandatory);
    group.get('fieldThresholdType').patchValue(field.thresholdType);
    group.get('quantityDataType').patchValue(quantityDataType);

    return group;
  }

  private createThresholdGroup(fieldInstance: FieldInstance): FormGroup {
    // Constraints: Pairwise (not) empty, absolute has to be filled if any other has values
    const optionalThresholdNames = ['idealLower', 'idealUpper', 'criticalLower', 'criticalUpper'];
    const thresholdForm = this.formBuilder.group({
      id: [],
      absoluteLower: [fieldInstance.absoluteThreshold?.valueLower,
        [CustomFormValidators.requiredFloatingNumber(),
          CustomFormValidators.requiredIfOtherNotEmpty('absoluteUpper'),
          CustomFormValidators.requiredIfAnyOtherNotEmpty(optionalThresholdNames)]],
      absoluteUpper: [fieldInstance.absoluteThreshold?.valueUpper,
        [CustomFormValidators.requiredFloatingNumber(),
          CustomFormValidators.requiredIfOtherNotEmpty('absoluteLower'),
          CustomFormValidators.requiredIfAnyOtherNotEmpty(optionalThresholdNames)]],
      idealLower: [fieldInstance.idealThreshold?.valueLower,
        [CustomFormValidators.requiredFloatingNumber(),
          CustomFormValidators.requiredIfOtherNotEmpty('idealUpper')]],
      idealUpper: [fieldInstance.idealThreshold?.valueUpper,
        [CustomFormValidators.requiredFloatingNumber(),
          CustomFormValidators.requiredIfOtherNotEmpty('idealLower')]],
      criticalLower: [fieldInstance.criticalThreshold?.valueLower,
        [CustomFormValidators.requiredFloatingNumber(),
          CustomFormValidators.requiredIfOtherNotEmpty('criticalUpper')]],
      criticalUpper: [fieldInstance.criticalThreshold?.valueUpper,
        [CustomFormValidators.requiredFloatingNumber(),
          CustomFormValidators.requiredIfOtherNotEmpty('criticalLower')]],
    });

    thresholdForm.get('absoluteLower').valueChanges.subscribe(() => this.validateForm(thresholdForm));
    thresholdForm.get('absoluteUpper').valueChanges.subscribe(() => this.validateForm(thresholdForm));
    thresholdForm.get('idealUpper')   .valueChanges.subscribe(() => this.validateForm(thresholdForm));
    thresholdForm.get('idealLower')   .valueChanges.subscribe(() => this.validateForm(thresholdForm));
    thresholdForm.get('criticalUpper').valueChanges.subscribe(() => this.validateForm(thresholdForm));
    thresholdForm.get('criticalLower').valueChanges.subscribe(() => this.validateForm(thresholdForm));

    return thresholdForm;
  }

  private validateForm(formGroup: FormGroup): void {
    if (formGroup != null) {
      Object.keys(formGroup.controls).forEach(controlsKey => {
        formGroup.get(controlsKey).updateValueAndValidity({ onlySelf: true, emitEvent: false });
        formGroup.get(controlsKey).markAsDirty();
      });
    }
  }

  removeMetric(metricGroup: AbstractControl): void {
    if (this.isReview) {
      this.backToEditPage.emit();
      return;
    }
    if (metricGroup == null || metricGroup.get('mandatory') === null || metricGroup.get('mandatory').value === true) {
      return;
    }
    const indexFieldInstances: number = metricGroup.get('indexFieldInstances').value;
    const indexInArray: number = metricGroup.get('indexInArray').value;
    this.fieldInstancesFormArray.removeAt(indexInArray);
    this.asset.fieldInstances.splice(indexFieldInstances, 1);

    for (let i = indexInArray; i < this.fieldInstancesFormArray.length; i++) {
      const indexInArrayElement = this.fieldInstancesFormArray.at(i).get('indexInArray');
      const indexInFieldInstancesElement = this.fieldInstancesFormArray.at(i).get('indexFieldInstances');
      indexInArrayElement.setValue(indexInArrayElement.value - 1);
      indexInFieldInstancesElement.setValue(indexInFieldInstancesElement.value - 1);
    }
  }

  public saveValues() {
    if (this.fieldInstancesFormArray.valid) {
      this.fieldInstancesFormArray.controls.forEach((metricGroup: FormControl) => {
        this.asset.fieldInstances[metricGroup.get('indexFieldInstances').value] = this.getFieldInstanceFromForm(metricGroup);
      });
    }
  }

  private getFieldInstanceFromForm(metricGroup: AbstractControl): FieldInstance {
    const thresholdGroup = metricGroup.get('thresholds');
    const quantityDataType = metricGroup.get('quantityDataType').value;
    const fieldInstance = this.asset.fieldInstances[metricGroup.get('indexFieldInstances').value];

    return {
      ...fieldInstance,
      fieldSource: { ...fieldInstance.fieldSource },
      absoluteThreshold: AssetWizardSharedMetricsComponent.getThresholdFromForm(thresholdGroup,
        ThresholdType.ABSOLUTE, quantityDataType),
      idealThreshold: AssetWizardSharedMetricsComponent.getThresholdFromForm(thresholdGroup,
        ThresholdType.IDEAL, quantityDataType),
      criticalThreshold: AssetWizardSharedMetricsComponent.getThresholdFromForm(thresholdGroup,
        ThresholdType.CRITICAL, quantityDataType)
    };
  }

  public onClickEdit() {
    this.backToEditPage.emit();
  }
}
