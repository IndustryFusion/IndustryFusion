import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FieldSource } from '../../../../../store/field-source/field-source.model';
import { AssetSeries } from '../../../../../store/asset-series/asset-series.model';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldType } from '../../../../../store/field-target/field-target.model';
import { FieldQuery } from '../../../../../store/field/field-query.service';
import { WizardHelper } from '../../../../../common/utils/wizard-helper';

@Component({
  selector: 'app-asset-series-wizard-attributes',
  templateUrl: './asset-series-wizard-attributes.component.html',
  styleUrls: ['./asset-series-wizard-attributes.component.scss']
})
export class AssetSeriesWizardAttributesComponent implements OnInit {

  @Input() assetSeries: AssetSeries;
  @Output() valid = new EventEmitter<boolean>();

  fieldSourcesFormArray: FormArray;

  constructor(private fieldQuery: FieldQuery,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.createFormArray(this.assetSeries.fieldSources);
  }

  private createFormArray(fieldSources: FieldSource[]): void {
    this.fieldSourcesFormArray = new FormArray([]);
    this.fieldSourcesFormArray.valueChanges.subscribe(() => this.valid.emit(this.fieldSourcesFormArray.valid));
    for (let i = 0; i < fieldSources.length; i++) {
      if (fieldSources[i].fieldTarget.fieldType === FieldType.ATTRIBUTE) {
        const formGroup = this.createSingleFieldSourceFormGroup(i, this.fieldSourcesFormArray.length, fieldSources[i]);
        this.fieldSourcesFormArray.push(formGroup);
      }
    }
    this.valid.emit(this.fieldSourcesFormArray.valid);
  }

  private createSingleFieldSourceFormGroup(indexFieldSources: number,
                                           indexInArray: number,
                                           fieldSource: FieldSource): FormGroup {
    const field = this.fieldQuery.getEntity(fieldSource.fieldTarget.fieldId);
    return this.formBuilder.group({
      id: [fieldSource.id],
      indexFieldSources: [indexFieldSources],
      indexInArray: [indexInArray],
      sourceUnitName: [fieldSource.sourceUnit?.name],
      fieldName: [field.name],
      name: [fieldSource.name],
      value: [fieldSource.value, [Validators.maxLength(255)]],
      mandatory: [fieldSource.fieldTarget.mandatory],
      saved: [true, Validators.requiredTrue],
    });
  }

  removeAttribute(attributeGroup: AbstractControl): void {
    if (!this.isMandatory(attributeGroup) && attributeGroup instanceof FormGroup) {
      WizardHelper.removeItemFromFormAndDataArray(attributeGroup,
        this.fieldSourcesFormArray, 'indexInArray',
        this.assetSeries.fieldSources, 'indexFieldSources');
    }
  }

  saveValue(group: AbstractControl): void {
    const fieldSource: FieldSource = this.assetSeries.fieldSources[group.get('indexInArray').value] as FieldSource;
    fieldSource.value = group.get('value').value;
    this.assetSeries.fieldSources[group.get('indexInArray').value] = fieldSource;
    group.get('saved').patchValue(true);
  }

  isUnsaved(group: AbstractControl): boolean {
    return !group.get('saved').value;
  }

  isMandatory(group: AbstractControl): boolean {
    return group == null || group.get('mandatory').value;
  }
}
