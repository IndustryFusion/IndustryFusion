import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FieldSource } from '../../../../../store/field-source/field-source.model';
import { AssetSeries } from '../../../../../store/asset-series/asset-series.model';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldType } from '../../../../../store/field-target/field-target.model';
import { FieldQuery } from '../../../../../store/field/field-query.service';

@Component({
  selector: 'app-asset-series-create-attributes',
  templateUrl: './asset-series-create-attributes.component.html',
  styleUrls: ['./asset-series-create-attributes.component.scss']
})
export class AssetSeriesCreateAttributesComponent implements OnInit {

  @Input() assetSeries: AssetSeries;
  @Output() valid = new EventEmitter<boolean>();

  fieldSourcesFormArray: FormArray;

  constructor(private fieldQuery: FieldQuery,
              private formBuilder: FormBuilder) {
  }

  private createFieldSourceGroup(index: number, fieldSource: FieldSource): FormGroup {
    const group = this.formBuilder.group({
      id: [],
      index: [],
      sourceUnitName: [],
      fieldName: [],
      name: [],
      value: ['', [Validators.max(255)]],
      saved: [true, Validators.requiredTrue],
    });
    group.get('id').patchValue(fieldSource.id);
    group.get('index').patchValue(index);
    group.get('sourceUnitName').patchValue(fieldSource.sourceUnit?.name);
    group.get('name').patchValue(fieldSource.name);
    group.get('value').patchValue(fieldSource.value);
    const field = this.fieldQuery.getEntity(fieldSource.fieldTarget.fieldId);
    group.get('fieldName').patchValue(field.name);
    return group;
  }

  ngOnInit(): void {
    this.fillTable(this.assetSeries.fieldSources);
  }

  removeValue(group: AbstractControl): void {
    group.get('value').setValue(null);
    this.saveValue(group);
  }

  saveValue(group: AbstractControl): void {
    const fieldSource: FieldSource = this.assetSeries.fieldSources[group.get('index').value] as FieldSource;
    fieldSource.value  =  group.get('value').value;
    this.assetSeries.fieldSources[group.get('index').value] = fieldSource;
    group.get('saved').patchValue(true);
  }

  private fillTable(fieldSources: FieldSource[]): void {
    this.fieldSourcesFormArray = new FormArray([]);
    this.fieldSourcesFormArray.valueChanges.subscribe(() => this.valid.emit(this.fieldSourcesFormArray.valid));
    for (let i = 0; i < fieldSources.length; i++) {
      if (fieldSources[i].fieldTarget.fieldType === FieldType.ATTRIBUTE) {
        const formGroup = this.createFieldSourceGroup(i, fieldSources[i]);
        this.fieldSourcesFormArray.push(formGroup);
      }
    }
    this.valid.emit(this.fieldSourcesFormArray.valid);
  }

  isEditMode(group: AbstractControl): boolean {
    return !group.get('saved').value;
  }
}
