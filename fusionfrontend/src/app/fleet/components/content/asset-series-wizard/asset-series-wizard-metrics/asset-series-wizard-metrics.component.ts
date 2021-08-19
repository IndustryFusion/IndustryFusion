import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AssetSeries } from '../../../../../store/asset-series/asset-series.model';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldSource } from '../../../../../store/field-source/field-source.model';
import { FieldType } from '../../../../../store/field-target/field-target.model';
import { FieldQuery } from '../../../../../store/field/field-query.service';
import { WizardHelper } from '../../../../../common/utils/wizard-helper';

@Component({
  selector: 'app-asset-series-wizard-metrics',
  templateUrl: './asset-series-wizard-metrics.component.html',
  styleUrls: ['./asset-series-wizard-metrics.component.scss']
})
export class AssetSeriesWizardMetricsComponent implements OnInit {

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
    this.valid.emit(this.fieldSourcesFormArray.valid);
    this.fieldSourcesFormArray.valueChanges.subscribe(() => this.valid.emit(this.fieldSourcesFormArray.valid));

    for (let i = 0; i < fieldSources.length; i++) {
      if (fieldSources[i].fieldTarget.fieldType === FieldType.METRIC) {
        const formGroup = this.createSingleFieldSourceFormGroup(i, this.fieldSourcesFormArray.length, fieldSources[i]);
        this.fieldSourcesFormArray.push(formGroup);
      }
    }
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
      accuracy: [field.accuracy],
      name: [fieldSource.name],
      register: [fieldSource.register, WizardHelper.maxTextLengthValidator],
      mandatory: [fieldSource.fieldTarget.mandatory],
      saved: [true, Validators.requiredTrue],
    });
  }

  removeMetric(metricGroup: AbstractControl): void {
    if (!this.isMandatory(metricGroup) && metricGroup instanceof FormGroup) {
      WizardHelper.removeItemFromFormAndDataArray(metricGroup,
        this.fieldSourcesFormArray, 'indexInArray',
        this.assetSeries.fieldSources, 'indexFieldSources');
    }
  }

  saveValue(group: AbstractControl): void {
    this.assetSeries.fieldSources[group.get('indexInArray').value].register =  group.get('register').value;
    group.get('saved').patchValue(true);
  }

  isUnsaved(group: AbstractControl): boolean {
    return !group.get('saved').value;
  }

  isMandatory(group: AbstractControl): boolean {
    return group == null || group.get('mandatory').value;
  }
}
