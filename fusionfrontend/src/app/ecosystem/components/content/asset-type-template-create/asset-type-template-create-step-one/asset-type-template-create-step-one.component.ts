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

import { AssetType } from '../../../../../store/asset-type/asset-type.model';
import { AssetTypeQuery } from '../../../../../store/asset-type/asset-type.query';
import { FormGroup } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { AssetTypeTemplate } from '../../../../../store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateQuery } from '../../../../../store/asset-type-template/asset-type-template.query';
import { map } from 'rxjs/operators';
import { AssetTypeTemplateDialogStepType } from '../asset-type-template-create.model';

@Component({
  selector: 'app-asset-type-template-create-step-one',
  templateUrl: './asset-type-template-create-step-one.component.html',
  styleUrls: ['./asset-type-template-create-step-one.component.scss']
})
export class AssetTypeTemplateCreateStepOneComponent implements OnInit {

  @Input() assetTypeTemplateForm: FormGroup;
  @Output() stepChange = new EventEmitter<number>();
  @Output() changeUseOfTemplate = new EventEmitter<number>();

  public assetTypes$: Observable<AssetType[]>;
  public assetTypeTemplates$: Observable<AssetTypeTemplate[]>;

  constructor(private assetTypeQuery: AssetTypeQuery,
              private assetTypeTemplateQuery: AssetTypeTemplateQuery,
              public ref: DynamicDialogRef) { }

  ngOnInit() {
    this.assetTypes$ = this.assetTypeQuery.selectAll();
    this.assetTypeTemplates$ = this.assetTypeTemplateQuery.selectAll();

    const assetTypeId = this.assetTypeTemplateForm.get('assetTypeId')?.value;
    if (assetTypeId) {
      this.onChangeAssetType(assetTypeId);
    }
  }

  nextStep() {
    if (this.assetTypeTemplateForm?.valid) {
      this.stepChange.emit(AssetTypeTemplateDialogStepType.METRICS);
    }
  }

  onCancel() {
    this.ref.close();
  }

  onChangeAssetType(assetTypeId: number) {
    const assetType = this.assetTypeQuery.getEntity(assetTypeId);
    this.replaceTemplateNameFromAssetType(assetType);
    this.assetTypeTemplates$ = this.assetTypeTemplateQuery.selectAll().
      pipe(map( a => a.filter(value => value.assetTypeId === assetType.id)));
  }

  private replaceTemplateNameFromAssetType(assetType: AssetType) {
    if (assetType) {
      this.assetTypeTemplateForm.get('name')?.setValue(assetType.name + ' v.');
    }
  }

  onResetUseOfTemplate() {
    this.changeUseOfTemplate.emit(null);
  }

  onChangeTemplate(id: number) {
    this.changeUseOfTemplate.emit(id);
  }

  onUseOfTemplate() {
    this.changeUseOfTemplate.emit(this.assetTypeTemplateForm.get('assetTypeTemplateId')?.value);
  }
}
