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
import { FieldInstance } from '../../../../../store/field-instance/field-instance.model';
import { CustomFormValidators } from '../../../../../common/utils/custom-form-validators';
import { Asset } from '../../../../../store/asset/asset.model';
import { FieldType } from '../../../../../store/field-target/field-target.model';
import { FieldQuery } from '../../../../../store/field/field-query.service';

@Component({
  selector: 'app-asset-wizard-field-instance-attributes',
  templateUrl: './asset-wizard-field-instance-attributes.component.html',
  styleUrls: ['./asset-wizard-field-instance-attributes.component.scss']
})
export class AssetWizardFieldInstanceAttributesComponent implements OnInit {

  @Input() asset: Asset;
  @Input() isReview = false;
  @Output() changeIsValid = new EventEmitter<boolean>();
  @Output() backToEditPage = new EventEmitter<void>();

  fieldInstancesFormArray: FormArray;

  constructor(private fieldQuery: FieldQuery,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.fillTable(this.asset.fieldInstances);
  }

  private fillTable(fieldInstances: FieldInstance[]) {
    this.fieldInstancesFormArray = new FormArray([]);
    this.fieldInstancesFormArray.valueChanges.subscribe(() => this.changeIsValid.emit(this.fieldInstancesFormArray.valid));

    for (let i = 0; i < fieldInstances.length; i++) {
      if (fieldInstances[i].fieldSource.fieldTarget.fieldType === FieldType.ATTRIBUTE) {
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
      value: [CustomFormValidators.requiredFloatingNumber()],
      sourceUnitName: [],
      mandatory: [],
      valid: [true, Validators.requiredTrue],
    });

    const field = this.fieldQuery.getEntity(fieldInstance.fieldSource.fieldTarget.fieldId);

    group.get('id').patchValue(fieldInstance.id);
    group.get('indexFieldInstances').patchValue(indexFieldInstances);
    group.get('indexInArray').patchValue(indexInArray);
    group.get('name').patchValue(fieldInstance.name);
    group.get('fieldName').patchValue(field.name);
    group.get('value').patchValue(fieldInstance.value);
    group.get('sourceUnitName').patchValue(fieldInstance.fieldSource.sourceUnit.name);
    group.get('mandatory').patchValue(fieldInstance.fieldSource.fieldTarget.mandatory);

    return group;
  }

  public removeAttribute(attributeGroup: AbstractControl): void {
    if (this.isReview) {
      this.backToEditPage.emit();
      return;
    }
    if (attributeGroup == null
      || attributeGroup.get('mandatory') === null || attributeGroup.get('mandatory').value === true) {
      return;
    }

    const indexFieldInstances: number = attributeGroup.get('indexFieldInstances').value;
    const indexInArray: number = attributeGroup.get('indexInArray').value;
    this.fieldInstancesFormArray.removeAt(indexInArray);
    this.asset.fieldInstances.splice(indexFieldInstances, 1);

    for (let i = indexInArray; i < this.fieldInstancesFormArray.length; i++) {
      const indexInArrayElement = this.fieldInstancesFormArray.at(i).get('indexInArray');
      const indexInFieldInstancesElement = this.fieldInstancesFormArray.at(i).get('indexFieldInstances');
      indexInArrayElement.setValue(indexInArrayElement.value - 1);
      indexInFieldInstancesElement.setValue(indexInFieldInstancesElement.value - 1);
    }
  }

  private getFieldInstanceFromForm(attributeGroup: AbstractControl): FieldInstance {
    const fieldInstance = this.asset.fieldInstances[attributeGroup.get('index').value];

    return {
      ...fieldInstance,
      fieldSource: { ...fieldInstance.fieldSource },
      value: attributeGroup.get('value').value,
      absoluteThreshold: null,
      idealThreshold: null,
      criticalThreshold: null
    };
  }

  public saveValues() {
    if (this.fieldInstancesFormArray.valid) {
      this.fieldInstancesFormArray.controls.forEach((attributeGroup: FormControl) => {
        this.asset.fieldInstances[attributeGroup.get('index').value] = this.getFieldInstanceFromForm(attributeGroup);
      });
    }
  }

  public onClickEdit() {
    this.backToEditPage.emit();
  }
}
