import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AssetSeries } from '../../../../../store/asset-series/asset-series.model';
import { Observable } from 'rxjs';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldSource } from '../../../../../store/field-source/field-source.model';
import { FieldSourceQuery } from '../../../../../store/field-source/field-source.query';
import { FieldSourceService } from '../../../../../store/field-source/field-source.service';
import { FieldType } from '../../../../../store/field-target/field-target.model';
import { FieldQuery } from '../../../../../store/field/field-query.service';

@Component({
  selector: 'app-asset-series-create-metrics',
  templateUrl: './asset-series-create-metrics.component.html',
  styleUrls: ['./asset-series-create-metrics.component.scss']
})
export class AssetSeriesCreateMetricsComponent implements OnInit {

  @Output() stepChange = new EventEmitter<number>();
  @Output() errorSignal = new EventEmitter<string>();
  @Input() assetSeries: AssetSeries;
  @Input() assetSeries$: Observable<AssetSeries>;

  fieldSourcesFormArray: FormArray;
  $loading: Observable<boolean>;
  private fieldSources: FieldSource[];

  constructor(private fieldSourceQuery: FieldSourceQuery,
              private fieldQuery: FieldQuery,
              private fieldSourceService: FieldSourceService,
              private formBuilder: FormBuilder) {
    this.$loading = this.fieldSourceQuery.selectLoading();
  }

  private createFieldSourceGroup(fieldSource: FieldSource): FormGroup {
    const group = this.formBuilder.group({
      id: [],
      sourceUnitName: [],
      sourceSensorLabel: [],
      accuracy: [],
      name: [],
      register: ['', [Validators.required, Validators.max(255)]],
      saved: [true, Validators.requiredTrue],
    });
    group.get('id').patchValue(fieldSource.id);
    group.get('sourceUnitName').patchValue(fieldSource.sourceUnit?.name);
    group.get('sourceSensorLabel').patchValue(fieldSource.sourceSensorLabel);
    group.get('name').patchValue(fieldSource.name);
    group.get('register').patchValue(fieldSource.register);

    const field = this.fieldQuery.getEntity(fieldSource.fieldTarget.fieldId);
    group.get('accuracy').patchValue(field?.accuracy);

    return group;
  }

  ngOnInit(): void {
    this.fieldSourceQuery.getAllFieldSource().subscribe(value => {
      if (!this.fieldSourcesFormArray || this.fieldSourcesFormArray?.length <= 0) {
        this.fillTable(value);
      }
      this.fieldSources = value;
    });
    this.fieldSourceService.getFieldSourcesOfAssetSeries(this.assetSeries.companyId, this.assetSeries.id).subscribe();
  }

  saveValue(group: AbstractControl) {
    let fieldSource = this.fieldSources.find(fieldsource => fieldsource.id === group.get('id').value);
    fieldSource = { ...fieldSource};
    fieldSource.register = group.get('register').value;
    this.fieldSourceService.editItem(this.assetSeries.companyId, fieldSource).subscribe();
    group.get('saved').patchValue(true);
  }

  private fillTable(fieldSources: FieldSource[]) {
    const formGroups = fieldSources
      .filter(fieldSource => fieldSource.fieldTarget.fieldType === FieldType.METRIC)
      .map(fieldSource => this.createFieldSourceGroup(fieldSource));
    this.fieldSourcesFormArray = new FormArray(formGroups);
  }

  isEditMode(group: AbstractControl): boolean {
    return !group.get('saved').value;
  }
}
