import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { FieldSource } from '../../../../../store/field-source/field-source.model';
import { AssetSeries } from '../../../../../store/asset-series/asset-series.model';
import { FieldSourceService } from '../../../../../store/field-source/field-source.service';
import { FieldSourceQuery } from '../../../../../store/field-source/field-source.query';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldType } from '../../../../../store/field-target/field-target.model';

@Component({
  selector: 'app-asset-series-create-attributes',
  templateUrl: './asset-series-create-attributes.component.html',
  styleUrls: ['./asset-series-create-attributes.component.scss']
})
export class AssetSeriesCreateAttributesComponent implements OnInit {

  @Output() stepChange = new EventEmitter<number>();
  @Output() errorSignal = new EventEmitter<string>();
  @Input() assetSeries: AssetSeries;
  @Input() assetSeries$: Observable<AssetSeries>;

  fieldSourcesFormArray: FormArray;
  $loading: Observable<boolean>;
  private fieldSources: FieldSource[];

  constructor(private fieldSourceQuery: FieldSourceQuery,
              private fieldSourceService: FieldSourceService,
              private formBuilder: FormBuilder) {
    this.$loading = this.fieldSourceQuery.selectLoading();
  }

  private createFieldSourceGroup(fieldSource: FieldSource): FormGroup {
    const group = this.formBuilder.group({
      id: [],
      sourceUnitName: [],
      sourceSensorLabel: [],
      name: [],
      value: ['', [Validators.required, Validators.max(255)]],
      saved: [true, Validators.requiredTrue],
    });
    group.get('id').patchValue(fieldSource.id);
    group.get('sourceUnitName').patchValue(fieldSource.sourceUnit?.name);
    group.get('sourceSensorLabel').patchValue(fieldSource.sourceSensorLabel);
    group.get('name').patchValue(fieldSource.name);
    group.get('value').patchValue(fieldSource.value);
    return group;
  }

  ngOnInit(): void {
    this.fieldSourceQuery.getAllFieldSources().subscribe(value => {
      if (!this.fieldSourcesFormArray || this.fieldSourcesFormArray?.length <= 0) {
        this.fillTable(value);
      }
      this.fieldSources = value;
    });
    this.fieldSourceService.getFieldSourcesOfAssetSeries(this.assetSeries.companyId, this.assetSeries.id).subscribe();
  }

  removeValue(group: AbstractControl) {
    group.get('value').setValue(null);
    this.saveValue(group);
  }

  saveValue(group: AbstractControl) {
    let fieldSource = this.fieldSources.find(fieldsource => fieldsource.id === group.get('id').value);
    fieldSource = { ...fieldSource};
    fieldSource.value = group.get('value').value;
    this.fieldSourceService.editItem(this.assetSeries.companyId, fieldSource).subscribe();
    group.get('saved').patchValue(true);
  }

  private fillTable(fieldSources: FieldSource[]) {
    const formGroups = fieldSources
      .filter(fieldSource => fieldSource.fieldTarget.fieldType === FieldType.ATTRIBUTE)
      .map(fieldSource => this.createFieldSourceGroup(fieldSource));
    this.fieldSourcesFormArray = new FormArray(formGroups);
  }

  isEditMode(group: AbstractControl): boolean {
    return !group.get('saved').value;
  }
}
