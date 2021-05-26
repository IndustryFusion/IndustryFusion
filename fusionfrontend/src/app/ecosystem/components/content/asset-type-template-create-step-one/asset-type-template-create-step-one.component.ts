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

import { AssetType } from '../../../../store/asset-type/asset-type.model';
import { AssetTypeQuery } from '../../../../store/asset-type/asset-type.query';
import { AssetTypeService } from '../../../../store/asset-type/asset-type.service';
import { FormGroup } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { AssetTypeTemplate } from '../../../../store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateQuery } from '../../../../store/asset-type-template/asset-type-template.query';

@Component({
  selector: 'app-asset-type-template-create-step-one',
  templateUrl: './asset-type-template-create-step-one.component.html',
  styleUrls: ['./asset-type-template-create-step-one.component.scss']
})
export class AssetTypeTemplateCreateStepOneComponent implements OnInit {

  @Output() stepChange = new EventEmitter<number>();

  public assetTypes$: Observable<AssetType[]>;
  public assetTypeTemplates$: Observable<AssetTypeTemplate[]>;

  @Input()
  @Output()
  public assetTypeTemplateForm: FormGroup;

  public shouldShowCreateAssetType = false; // TODO: Call with dynamic prime dialog

  constructor(private assetTypeQuery: AssetTypeQuery,
              private assetTypeTemplateQuery: AssetTypeTemplateQuery,
              public ref: DynamicDialogRef,
              private assetTypeService: AssetTypeService) { }

  ngOnInit() {
    this.assetTypes$ = this.assetTypeQuery.selectAll();
    this.assetTypeTemplates$ = this.assetTypeTemplateQuery.selectAll();

    // TODO: Not working, getEntity yields undefined from ID 1
    const assetType = this.assetTypeQuery.getEntity(this.assetTypeTemplateForm.get('assetTypeId')?.value);
    this.replaceTemplateNameFromAssetType(assetType);
  }

  nextStep() {
    if (this.assetTypeTemplateForm?.valid) {
      this.stepChange.emit(2);
    }
  }

  onCancel() {
    this.ref.close();
  }

  createAssetTypeModal() {
    this.shouldShowCreateAssetType = true;
  }

  onDismissModal() {
    this.shouldShowCreateAssetType = false;
  }

  onConfirmModal(item: any) {
    this.assetTypeService.createItem(item).subscribe();
    this.shouldShowCreateAssetType = false;
  }

  onChangeAssetType($event: any) {
    const assetType = this.assetTypeQuery.getEntity($event.value);
    this.replaceTemplateNameFromAssetType(assetType);
  }

  private replaceTemplateNameFromAssetType(assetType: AssetType) {
    if (assetType) {
      this.assetTypeTemplateForm.get('name')?.setValue(assetType.name + ' v.');
      this.assetTypeTemplateForm.get('description')?.setValue(assetType.description);
    }
  }
}
