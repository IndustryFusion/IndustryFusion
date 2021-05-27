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
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-asset-type-template-create-step-three',
  templateUrl: './asset-type-template-create-step-three.component.html',
  styleUrls: ['./asset-type-template-create-step-three.component.scss']
})
export class AssetTypeTemplateCreateStepThreeComponent implements OnInit {

  @Input() inputMetrics: Array<FieldTarget>;
  @Output() stepChange = new EventEmitter<number>();
  @Output() attributeSelect = new EventEmitter<FieldTarget[]>();

  @Input()
  @Output()
  public assetTypeTemplateForm: FormGroup;

  shouldAddAttribute = false;
  metricsAndAttributes$: Observable<Metric[]>;
  confirmedAttributes: Array<FieldTarget> = [];
  selectedAttributes: Array<FieldTarget> = [];
  // metric: Metric;

  shouldShowCreateAttribute = false;

  constructor(private metricQuery: MetricQuery, private metricService: MetricService) { }

  ngOnInit() {
    this.metricsAndAttributes$ = this.metricQuery.selectAll();
    // TODO: Does this also yields attributes? filter using fieldType of field_target

    if (this.inputMetrics) {
      this.selectedAttributes = this.selectedAttributes.concat(this.inputMetrics);
      this.confirmedAttributes = this.confirmedAttributes.concat(this.inputMetrics);
    }
  }

  isConfirmed(metric: FieldTarget): boolean {
    return this.confirmedAttributes.indexOf(metric) !== -1;
  }

  private changeStep(step: number) {
    if (this.confirmedAttributes.length === this.selectedAttributes.length  && this.assetTypeTemplateForm?.valid) {
      this.attributeSelect.emit(this.confirmedAttributes);
      this.stepChange.emit(step);
    }
  }

  prevStep() {
    this.changeStep(2);
  }

  nextStep() {
    this.changeStep(4);
  }

  addAttribute() {
    this.shouldAddAttribute = true;
  }

  onChangeAttribute(value: Metric) {
    const fieldTarget = new FieldTarget();
    fieldTarget.fieldType = FieldType.ATTRIBUTE;
    fieldTarget.field = value;
    fieldTarget.fieldId = value.id;
    fieldTarget.mandatory = false;
    this.selectedAttributes.push(fieldTarget);
    this.shouldAddAttribute = false;
    // this.metric = undefined;
  }

  onConfirm(fieldTarget: FieldTarget) {
    this.confirmedAttributes.push(fieldTarget);
  }

  onEdit(fieldTarget: FieldTarget) {
    const index  = this.confirmedAttributes.indexOf(fieldTarget);
    if (index > -1) {
      this.confirmedAttributes.splice(index, 1);
    }
  }

  onDelete(fieldTarget: FieldTarget) {
    const index  = this.confirmedAttributes.indexOf(fieldTarget);
    if (index > -1) {
      this.confirmedAttributes.splice(index, 1);
    }

    const index1 = this.selectedAttributes.indexOf(fieldTarget);
    if (index1 > -1) {
      this.selectedAttributes.splice(index1, 1);
    }
  }

  createAttributeModal() {
    this.shouldShowCreateAttribute = true;
  }

  onDismissModal() {
    this.shouldShowCreateAttribute = false;
  }

  onConfirmModal(item: Metric) {
    this.metricService.createItem(item).subscribe({
      complete: () => this.shouldShowCreateAttribute = false
    });
  }
}
