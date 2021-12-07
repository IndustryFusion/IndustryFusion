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
import { FieldInstance } from '../../../../../../core/store/field-instance/field-instance.model';
import { CustomFormValidators } from '../../../../../../core/validators/custom-form-validators';
import { Asset } from '../../../../../../core/store/asset/asset.model';
import { FieldType } from '../../../../../../core/store/field-target/field-target.model';
import { FieldQuery } from '../../../../../../core/store/field/field.query';
import { WizardHelper } from '../../../../../../core/helpers/wizard-helper';
import { FieldDataType } from '../../../../../../core/store/field/field.model';

@Component({
  selector: 'app-asset-wizard-shared-attributes',
  templateUrl: './asset-wizard-shared-attributes.component.html',
  styleUrls: ['./asset-wizard-shared-attributes.component.scss']
})
export class AssetWizardSharedAttributesComponent implements OnInit {

  @Input() asset: Asset;
  @Input() isReview = false;
  @Output() changeIsValid = new EventEmitter<boolean>();
  @Output() backToEditPage = new EventEmitter<void>();

  fieldInstancesFormArray: FormArray;
  attributeDataTypes = FieldDataType;

  constructor(private fieldQuery: FieldQuery,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.fillTable(this.asset.fieldInstances);
  }

  public removeAttribute(attributeGroup: AbstractControl): void {
    if (this.isReview) {
      this.backToEditPage.emit();
      return;
    }

    if (!this.isMandatory(attributeGroup) && attributeGroup instanceof FormGroup) {
      WizardHelper.removeItemFromFormAndDataArray(attributeGroup,
        this.fieldInstancesFormArray, 'indexInArray',
        this.asset.fieldInstances, 'indexFieldInstances');
    }
  }

  public saveValues() {
    if (this.fieldInstancesFormArray.valid) {
      this.fieldInstancesFormArray.controls.forEach((attributeGroup: FormControl) => {
        this.asset.fieldInstances[attributeGroup.get('indexFieldInstances').value] = this.getFieldInstanceFromForm(attributeGroup);
      });
    }
  }

  public onClickEdit() {
    this.backToEditPage.emit();
  }

  public isMandatory(group: AbstractControl): boolean {
    return group == null || group.get('mandatory').value;
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
    const field = this.fieldQuery.getEntity(fieldInstance.fieldSource.fieldTarget.fieldId);

    const group = this.formBuilder.group({
      id: [],
      version: [],
      indexFieldInstances: [],
      indexInArray: [],
      name: [],
      fieldName: [],
      value: [CustomFormValidators.requiredFloatingNumber()],
      sourceUnitName: [],
      mandatory: [],
      valid: [true, Validators.requiredTrue],
      fieldDataType: [],
      fieldEnumOptions: []
    });

    group.get('id').patchValue(fieldInstance.id);
    group.get('version').patchValue(fieldInstance.version);
    group.get('indexFieldInstances').patchValue(indexFieldInstances);
    group.get('indexInArray').patchValue(indexInArray);
    group.get('name').patchValue(fieldInstance.name);
    group.get('fieldName').patchValue(field.name);
    group.get('sourceUnitName').patchValue(fieldInstance.fieldSource.sourceUnit?.name);
    group.get('mandatory').patchValue(fieldInstance.fieldSource.fieldTarget.mandatory);
    group.get('fieldDataType').patchValue(field.dataType);
    group.get('fieldEnumOptions').patchValue(field.enumOptions);

    if (fieldInstance.value) {
      group.get('value').patchValue(+fieldInstance.value);
    } else {
      group.get('value').patchValue(fieldInstance.fieldSource.value);
    }

    return group;
  }

  private getFieldInstanceFromForm(attributeGroup: AbstractControl): FieldInstance {
    const fieldInstance = this.asset.fieldInstances[attributeGroup.get('indexFieldInstances').value];

    return {
      ...fieldInstance,
      fieldSource: { ...fieldInstance.fieldSource },
      value: attributeGroup.get('value').value,
      absoluteThreshold: null,
      idealThreshold: null,
      criticalThreshold: null
    };
  }
}
