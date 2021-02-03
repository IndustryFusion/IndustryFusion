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

import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

import { Observable } from 'rxjs';

import { Metric } from '../../../../store/metric/metric.model';
import { FieldTarget } from '../../../../store/field-target/field-target.model';
import { MetricQuery } from '../../../../store/metric/metric.query';
import { FieldType } from '../../../../store/field/field.model';
import { MetricService } from '../../../../store/metric/metric.service';

@Component({
  selector: 'app-asset-type-template-create-step-three',
  templateUrl: './asset-type-template-create-step-three.component.html',
  styleUrls: ['./asset-type-template-create-step-three.component.scss']
})
export class AssetTypeTemplateCreateStepThreeComponent implements OnInit {

  @Input() inputMetrics: Array<FieldTarget>;
  @Output() stepChange = new EventEmitter<number>();
  @Output() attributeSelect = new EventEmitter<FieldTarget[]>();
  @Output() errorSignal = new EventEmitter<string>();

  shouldAddMetric = false;
  metrics$: Observable<Metric[]>;
  confirmedMetrics: Array<FieldTarget> = [];
  selectedMetrics: Array<FieldTarget> = [];
  metric: Metric;

  shouldShowCreateMetric = false;

  constructor(private metricQuery: MetricQuery, private metricService: MetricService) { }

  ngOnInit() {
    this.metrics$ = this.metricQuery.selectAll();

    if (this.inputMetrics) {
      this.selectedMetrics = this.selectedMetrics.concat(this.inputMetrics);
      this.confirmedMetrics = this.confirmedMetrics.concat(this.inputMetrics);
    }
  }

  isConfirmed(metric: FieldTarget): boolean {
    return this.confirmedMetrics.indexOf(metric) !== -1;
  }

  changeStep(step: number) {
    if (this.confirmedMetrics.length === this.selectedMetrics.length) {
      this.attributeSelect.emit(this.confirmedMetrics);
      this.stepChange.emit(step);
    } else {
      this.errorSignal.emit('All metrics needs to be CONFIRMED.');
    }
  }

  addMetric() {
    this.shouldAddMetric = true;
  }

  onChange(value: Metric) {
    const fieldTarget = new FieldTarget();
    fieldTarget.fieldType = FieldType.ATTRIBUTE;
    fieldTarget.field = value;
    fieldTarget.fieldId = value.id;
    fieldTarget.mandatory = false;
    this.selectedMetrics.push(fieldTarget);
    this.shouldAddMetric = false;
    this.metric = undefined;
  }

  onConfirm(fieldTarget: FieldTarget) {
    this.confirmedMetrics.push(fieldTarget);
  }

  onEdit(fieldTarget: FieldTarget) {
    const index  = this.confirmedMetrics.indexOf(fieldTarget);
    if (index > -1) {
      this.confirmedMetrics.splice(index, 1);
    }
  }

  onDelete(fieldTarget: FieldTarget) {
    const index  = this.confirmedMetrics.indexOf(fieldTarget);
    if (index > -1) {
      this.confirmedMetrics.splice(index, 1);
    }

    const index1 = this.selectedMetrics.indexOf(fieldTarget);
    if (index1 > -1) {
      this.selectedMetrics.splice(index1, 1);
    }
  }

  createMetricModal() {
    this.shouldShowCreateMetric = true;
  }

  onDismissModal() {
    this.shouldShowCreateMetric = false;
  }

  onConfirmModal(item: Metric) {
    this.metricService.createItem(item).subscribe({
      complete: () => this.shouldShowCreateMetric = false
    });
  }

}
