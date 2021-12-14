import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FieldSource } from '../../../../../core/store/field-source/field-source.model';
import { AssetSeries } from '../../../../../core/store/asset-series/asset-series.model';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldType } from '../../../../../core/store/field-target/field-target.model';
import { FieldQuery } from '../../../../../core/store/field/field.query';
import { WizardHelper } from '../../../../../core/helpers/wizard-helper';
import { FieldDataType } from '../../../../../core/store/field/field.model';

@Component({
  selector: 'app-asset-series-wizard-attributes',
  templateUrl: './asset-series-wizard-attributes.component.html',
  styleUrls: ['./asset-series-wizard-attributes.component.scss']
})
export class AssetSeriesWizardAttributesComponent implements OnInit {

  @Input() assetSeries: AssetSeries;
  @Input() fieldSourcesCanBeDeleted: boolean;
  @Output() valid = new EventEmitter<boolean>();

  fieldSourcesFormArray: FormArray;
  showNotDeletableWarning: boolean;

  attributeDataTypes = FieldDataType;

  constructor(private fieldQuery: FieldQuery,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.createFormArray(this.assetSeries.fieldSources);
    this.showNotDeletableWarning = !this.fieldSourcesCanBeDeleted;
  }

  removeAttribute(attributeGroup: AbstractControl): void {
    if (this.isDeletable(attributeGroup) && attributeGroup instanceof FormGroup) {
      WizardHelper.removeItemFromFormAndDataArray(attributeGroup,
        this.fieldSourcesFormArray, 'indexInArray',
        this.assetSeries.fieldSources, 'indexFieldSources');
    }
  }

  saveValue(group: AbstractControl): void {
    const fieldSource: FieldSource = this.assetSeries.fieldSources[group.get('indexFieldSources').value] as FieldSource;
    fieldSource.value = group.get('value').value;
    this.assetSeries.fieldSources[group.get('indexFieldSources').value] = fieldSource;
    group.get('saved').patchValue(true);
  }

  isUnsaved(group: AbstractControl): boolean {
    return !group.get('saved').value;
  }

  isDeletable(attributeGroup: AbstractControl): boolean {
    return attributeGroup != null && attributeGroup.get('mandatory').value === false && this.fieldSourcesCanBeDeleted;
  }

  hideNotDeletableWarning(): void {
    this.showNotDeletableWarning = false;
  }

  private createFormArray(fieldSources: FieldSource[]): void {
    this.fieldSourcesFormArray = new FormArray([]);
    this.fieldSourcesFormArray.valueChanges.subscribe(() => this.valid.emit(this.fieldSourcesFormArray.valid));
    for (let i = 0; i < fieldSources.length; i++) {
      if (fieldSources[i].fieldTarget.fieldType === FieldType.ATTRIBUTE) {
        // uses wrong index
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
    const valueValidator = fieldSource.fieldTarget.mandatory ? WizardHelper.requiredTextValidator : WizardHelper.maxTextLengthValidator;
    return this.formBuilder.group({
      id: [fieldSource.id],
      version: [fieldSource.version],
      globalId: [fieldSource.globalId],
      indexFieldSources: [indexFieldSources],
      indexInArray: [indexInArray],
      sourceUnitName: [fieldSource.sourceUnit?.name],
      fieldName: [field.name],
      name: [fieldSource.name],
      value: [fieldSource.value, valueValidator],
      mandatory: [fieldSource.fieldTarget.mandatory],
      saved: [true, Validators.requiredTrue],
      fieldDataType: [field.dataType],
      fieldEnumOptions: [field.enumOptions]
    });
  }
}
