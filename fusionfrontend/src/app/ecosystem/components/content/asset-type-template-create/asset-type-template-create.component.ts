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

@Component({
  selector: 'app-asset-type-template-create',
  templateUrl: './asset-type-template-create.component.html',
  styleUrls: ['./asset-type-template-create.component.scss']
})
export class AssetTypeTemplateCreateComponent implements OnInit {

  step = 1;
  assetType: ID;
  assteTypeTemplate: AssetTypeTemplate;
  error: any;

  constructor(private assetTypeTemplateService: AssetTypeTemplateService, private fieldTargetService: FieldTargetService) { }

  ngOnInit() {
    this.assteTypeTemplate = new AssetTypeTemplate();
    this.assteTypeTemplate.fieldTargets = [];
  }

  onStepChange(step: number) {
    this.error = undefined;
    this.step = step;
  }

  onAssetTypeSelect(id: ID) {
    this.assetType = id;
  }

  onNameSelect(name: string) {
    this.assteTypeTemplate.name = name;
  }

  onDescriptionSelect(description: string) {
    this.assteTypeTemplate.description = description;
  }

  onMetricsSelect(metrics: FieldTarget[]) {
    this.assteTypeTemplate.fieldTargets =  this.getAttributes().concat(metrics);
  }

  onAttributesSelect(attributes: FieldTarget[]) {
    this.assteTypeTemplate.fieldTargets =  this.getMetrics().concat(attributes);
  }

  onSaveTemplate() {
    this.assetTypeTemplateService.createTemplate(this.assteTypeTemplate, this.assetType).subscribe(
      (template) => {
        this.assteTypeTemplate.fieldTargets.forEach((fieldTarget) => {
          this.fieldTargetService.createItem(template.id, fieldTarget).subscribe();
        });
      }
    );
  }

  getMetrics(): FieldTarget[] {
    return this.assteTypeTemplate.fieldTargets.filter((metric) => metric.fieldType === FieldType.METRIC);
  }

  getAttributes(): FieldTarget[] {
    return this.assteTypeTemplate.fieldTargets.filter((metric) => metric.fieldType === FieldType.ATTRIBUTE);
  }

  onCloseError() {
    this.error = undefined;
  }

  onError(error: string) {
    this.error = error;
  }
}
