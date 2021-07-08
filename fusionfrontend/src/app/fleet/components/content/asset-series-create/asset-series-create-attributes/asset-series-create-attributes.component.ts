import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { FieldSource } from '../../../../../store/field-source/field-source.model';
import { AssetSeries } from '../../../../../store/asset-series/asset-series.model';
import { FieldSourceQuery } from '../../../../../store/field-source/field-source.query';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldType } from '../../../../../store/field-target/field-target.model';
import { FieldQuery } from '../../../../../store/field/field-query.service';

@Component({
  selector: 'app-asset-series-create-attributes',
  templateUrl: './asset-series-create-attributes.component.html',
  styleUrls: ['./asset-series-create-attributes.component.scss']
})
export class AssetSeriesCreateAttributesComponent implements OnInit {

  @Output() errorSignal = new EventEmitter<string>();
  @Output() valid = new EventEmitter<boolean>();
  @Input() assetSeries: AssetSeries;

  fieldSourcesFormArray: FormArray;
  $loading: Observable<boolean>;

  constructor(private fieldSourceQuery: FieldSourceQuery,
              private fieldQuery: FieldQuery,
              private formBuilder: FormBuilder) {
    this.$loading = this.fieldSourceQuery.selectLoading();
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

  removeValue(group: AbstractControl) {
    group.get('value').setValue(null);
    this.saveValue(group);
  }

  saveValue(group: AbstractControl) {
    const fieldSource: FieldSource = this.assetSeries.fieldSources[group.get('index').value] as FieldSource;
    fieldSource.value  =  group.get('value').value;
    this.assetSeries.fieldSources[group.get('index').value] = fieldSource;
    group.get('saved').patchValue(true);
  }

  private fillTable(fieldSources: FieldSource[]) {
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
