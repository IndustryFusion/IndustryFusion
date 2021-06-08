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

import { Observable } from 'rxjs';

import { Metric } from '../../../../../store/metric/metric.model';
import { MetricQuery } from '../../../../../store/metric/metric.query';
import { FieldTarget, FieldType } from '../../../../../store/field-target/field-target.model';
import { FormGroup } from '@angular/forms';
import { AssetTypeTemplateDialogStepType } from '../asset-type-template-create.model';

@Component({
  selector: 'app-asset-type-template-create-step-two',
  templateUrl: './asset-type-template-create-step-two.component.html',
  styleUrls: ['./asset-type-template-create-step-two.component.scss']
})
export class AssetTypeTemplateCreateStepTwoComponent implements OnInit {

  @Input() assetTypeTemplateForm: FormGroup;
  @Input() inputMetrics: Array<FieldTarget>;
  @Output() stepChange = new EventEmitter<number>();
  @Output() metricSelect = new EventEmitter<FieldTarget[]>();

  public shouldAddMetric = false;
  public metricsAndAttributes$: Observable<Metric[]>;
  public confirmedMetrics: Array<FieldTarget> = [];
  public selectedMetrics: Array<FieldTarget> = [];

  constructor(private metricQuery: MetricQuery) {
  }

  ngOnInit() {
    this.metricsAndAttributes$ = this.metricQuery.selectAll();

    if (this.inputMetrics) {
      this.selectedMetrics = this.selectedMetrics.concat(this.inputMetrics);
      this.confirmedMetrics = this.confirmedMetrics.concat(this.inputMetrics);
    }
  }

  isConfirmed(metric: FieldTarget): boolean {
    return this.confirmedMetrics.indexOf(metric) !== -1;
  }

  prevStep() {
    this.changeStep(AssetTypeTemplateDialogStepType.START);
  }

  nextStep() {
    this.changeStep(AssetTypeTemplateDialogStepType.ATTRIBUTES);
  }

  private changeStep(step: number) {
    if (this.confirmedMetrics.length === this.selectedMetrics.length && this.assetTypeTemplateForm?.valid) {
      this.metricSelect.emit(this.confirmedMetrics);
      this.stepChange.emit(step);
    }
  }

  addMetric() {
    this.shouldAddMetric = true;
  }

  onChangeMetric(value: Metric) {
    const fieldTarget = new FieldTarget();
    fieldTarget.fieldType = FieldType.METRIC;
    fieldTarget.field = value;
    fieldTarget.fieldId = value.id;
    fieldTarget.mandatory = false;
    this.selectedMetrics.push(fieldTarget);
    this.shouldAddMetric = false;
    this.assetTypeTemplateForm.get('metric').setValue(undefined);
  }

  onConfirm(fieldTarget: FieldTarget) {
    this.confirmedMetrics.push(fieldTarget);
  }

  onEdit(fieldTarget: FieldTarget) {
    const index = this.confirmedMetrics.indexOf(fieldTarget);
    if (index > -1) {
      this.confirmedMetrics.splice(index, 1);
    }
  }

  onDelete(fieldTarget: FieldTarget) {
    const index = this.confirmedMetrics.indexOf(fieldTarget);
    if (index > -1) {
      this.confirmedMetrics.splice(index, 1);
    }

    const index1 = this.selectedMetrics.indexOf(fieldTarget);
    if (index1 > -1) {
      this.selectedMetrics.splice(index1, 1);
    }
  }
}
