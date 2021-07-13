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
  @Input() editEnabled = true;
  @Output() valid = new EventEmitter<boolean>();
  @Output() edit = new EventEmitter<void>();

  fieldInstancesFormArray: FormArray;

  constructor(private fieldQuery: FieldQuery,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.fillTable(this.asset.fieldInstances);
  }

  private fillTable(fieldInstances: FieldInstance[]) {
    this.fieldInstancesFormArray = new FormArray([]);
    this.fieldInstancesFormArray.valueChanges.subscribe(() => this.valid.emit(this.fieldInstancesFormArray.valid));

    for (let i = 0; i < fieldInstances.length; i++) {
      if (fieldInstances[i].fieldSource.fieldTarget.fieldType === FieldType.ATTRIBUTE) {
        const formGroup = this.createFieldInstanceGroup(i, fieldInstances[i]);
        this.fieldInstancesFormArray.push(formGroup);
      }
    }
    this.valid.emit(this.fieldInstancesFormArray.valid);
  }

  private createFieldInstanceGroup(index: number, fieldInstance: FieldInstance): FormGroup {
    const group = this.formBuilder.group({
      id: [],
      index: [],
      name: [],
      fieldName: [],
      value: [CustomFormValidators.requiredFloatingNumber()],
      sourceUnitName: [],
      mandatory: [],
      valid: [true, Validators.requiredTrue],
    });

    const field = this.fieldQuery.getEntity(fieldInstance.fieldSource.fieldTarget.fieldId);

    group.get('id').patchValue(fieldInstance.id);
    group.get('index').patchValue(index);
    group.get('name').patchValue(fieldInstance.name);
    group.get('fieldName').patchValue(field.name);
    group.get('value').patchValue(fieldInstance.value);
    group.get('sourceUnitName').patchValue(fieldInstance.fieldSource.sourceUnit.name);
    group.get('mandatory').patchValue(fieldInstance.fieldSource.fieldTarget.mandatory);

    return group;
  }

  public removeAttribute(attributeGroup: AbstractControl): void {
    if (!this.editEnabled) {
      this.edit.emit();
      return;
    }
    if (attributeGroup == null
      || attributeGroup.get('mandatory') === null || attributeGroup.get('mandatory').value === true) {
      return;
    }
    const indexToRemove: number = attributeGroup.get('index').value;
    this.fieldInstancesFormArray.removeAt(indexToRemove);
    this.asset.fieldInstances.splice(indexToRemove, 1);
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
    this.edit.emit();
  }
}
