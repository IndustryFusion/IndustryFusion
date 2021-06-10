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
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AssetTypeTemplate } from '../../../../../store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateQuery } from '../../../../../store/asset-type-template/asset-type-template.query';
import { map } from 'rxjs/operators';
import { AssetTypeTemplateDialogStepType } from '../asset-type-template-create.model';
import { AssetTypesComposedQuery } from '../../../../../store/composed/asset-types-composed.query';
import { AssetTypeTemplateCreateStepWarningComponent } from '../asset-type-template-create-step-warning/asset-type-template-create-step-warning.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ID } from '@datorama/akita';

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

  public warningDialogRef: DynamicDialogRef;

  constructor(private assetTypeQuery: AssetTypeQuery,
              private assetTypeTemplateQuery: AssetTypeTemplateQuery,
              private assetTypesComposedQuery: AssetTypesComposedQuery,
              public ref: DynamicDialogRef,
              public dialogService: DialogService,
              private router: Router,
              public route: ActivatedRoute) { }

  ngOnInit() {
    this.assetTypes$ = this.assetTypeQuery.selectAll();
    this.assetTypeTemplates$ = this.assetTypeTemplateQuery.selectAll();

    const assetTypeId = this.assetTypeTemplateForm.get('assetTypeId')?.value;
    if (assetTypeId) {
      this.onChangeAssetType(assetTypeId);
    }
  }

  onStart() {
    if (this.assetTypeTemplateForm?.valid) {
      this.stepChange.emit(AssetTypeTemplateDialogStepType.METRICS);
      this.existsDraft().then(assetTypeTemplateId => {
        if (assetTypeTemplateId != null) {
          this.showWarningDialog(assetTypeTemplateId);
        } else {
          this.stepChange.emit(AssetTypeTemplateDialogStepType.METRICS);
        }
      });
    }
  }

  private showWarningDialog(assetTypeTemplateId: ID) {
    this.warningDialogRef = this.dialogService.open(AssetTypeTemplateCreateStepWarningComponent, { width: '70%' });
    this.warningDialogRef.onClose.subscribe((result: boolean | null) => this.onCloseWarningDialog(result, assetTypeTemplateId));
  }

  onCloseWarningDialog(goToDetails: boolean | null, assetTypeTemplateId: ID) {
    if (goToDetails != null && assetTypeTemplateId) {
      this.ref.close();
      this.router.navigate([assetTypeTemplateId], { relativeTo: this.route }).then();
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

  private existsDraft(): Promise<ID> {
    const assetTypeId = this.assetTypeTemplateForm.get('assetTypeId')?.value;

    return new Promise<ID>(resolve => {
      this.assetTypesComposedQuery.selectUnpublishedTemplatesOfAssetType(assetTypeId)
        .subscribe(assetTypeTemplates => resolve(assetTypeTemplates.length < 1 ? null : assetTypeTemplates[0]?.id));
    });
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
