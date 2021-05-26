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

import { Component, OnInit } from '@angular/core';
import { ID } from '@datorama/akita';

import { FieldTarget, FieldType } from '../../../../store/field-target/field-target.model';
import { AssetTypeTemplate } from '../../../../store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateService } from '../../../../store/asset-type-template/asset-type-template.service';
import { FieldTargetService } from '../../../../store/field-target/field-target.service';
import { AssetTypesResolver } from '../../../../resolvers/asset-types.resolver';
import { MetricsResolver } from '../../../../resolvers/metrics.resolver';
import { UnitsResolver } from '../../../../resolvers/units.resolver';
import { QuantityTypesResolver } from '../../../../resolvers/quantity-types.resolver';
import { FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-asset-type-template-create',
  templateUrl: './asset-type-template-create.component.html',
  styleUrls: ['./asset-type-template-create.component.scss']
})
export class AssetTypeTemplateCreateComponent implements OnInit {

  public assetTypeTemplateForm: FormGroup;

  public step = 1;
  public assetType: ID;
  public assetTypeTemplate: AssetTypeTemplate;
  public error: any;

  constructor(private assetTypeTemplateService: AssetTypeTemplateService,
              private fieldTargetService: FieldTargetService,
              private assetTypesResolver: AssetTypesResolver,
              private metricsResolver: MetricsResolver,
              private unitsResolver: UnitsResolver,
              private quantityTypesResolver: QuantityTypesResolver,
              public ref: DynamicDialogRef,
              public config: DynamicDialogConfig) { }

  ngOnInit() {
    this.assetTypesResolver.resolve().subscribe();
    this.metricsResolver.resolve().subscribe();
    this.unitsResolver.resolve().subscribe();
    this.quantityTypesResolver.resolve().subscribe();
    console.log('done');

    this.assetTypeTemplateForm = this.config.data.assetTypeTemplateForm;

    this.assetTypeTemplate = new AssetTypeTemplate();
    this.assetTypeTemplate.fieldTargets = [];
  }

  onStepChange(step: number) {
    this.error = undefined;
    this.step = step;
  }

  onAssetTypeSelect(id: ID) {
    this.assetType = id;
  }

  onNameSelect(name: string) {
    this.assetTypeTemplate.name = name;
  }

  onDescriptionSelect(description: string) {
    this.assetTypeTemplate.description = description;
  }

  onMetricsSelect(metrics: FieldTarget[]) {
    this.assetTypeTemplate.fieldTargets =  this.getAttributes().concat(metrics);
  }

  onAttributesSelect(attributes: FieldTarget[]) {
    this.assetTypeTemplate.fieldTargets =  this.getMetrics().concat(attributes);
  }

  onSaveTemplate() {
    this.assetTypeTemplateService.createTemplate(this.assetTypeTemplate, this.assetType).subscribe(
      (template) => {
        this.assetTypeTemplate.fieldTargets.forEach((fieldTarget) => {
          this.fieldTargetService.createItem(template.id, fieldTarget).subscribe();
        });
      }
    );
  }

  getMetrics(): FieldTarget[] {
    return this.assetTypeTemplate.fieldTargets.filter((metric) => metric.fieldType === FieldType.METRIC);
  }

  getAttributes(): FieldTarget[] {
    return this.assetTypeTemplate.fieldTargets.filter((metric) => metric.fieldType === FieldType.ATTRIBUTE);
  }

  onCloseError() {
    this.error = undefined;
  }

  onError(error: string) {
    this.error = error;
  }
}
