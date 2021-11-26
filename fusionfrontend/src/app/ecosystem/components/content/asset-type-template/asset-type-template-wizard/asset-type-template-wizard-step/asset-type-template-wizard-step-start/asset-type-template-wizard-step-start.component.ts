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

import { AssetType } from '../../../../../../../core/store/asset-type/asset-type.model';
import { AssetTypeQuery } from '../../../../../../../core/store/asset-type/asset-type.query';
import { FormGroup } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AssetTypeTemplate } from '../../../../../../../core/store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateQuery } from '../../../../../../../core/store/asset-type-template/asset-type-template.query';
import { map } from 'rxjs/operators';
import { AssetTypeTemplateWizardSteps } from '../../asset-type-template-wizard-steps.model';
import { AssetTypesComposedQuery } from '../../../../../../../core/store/composed/asset-types-composed.query';
import { AssetTypeTemplateWizardWarningDialogComponent } from '../../asset-type-template-wizard-warning-dialog/asset-type-template-wizard-warning-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ID } from '@datorama/akita';
import { NameWithVersionPipe } from '../../../../../../../shared/pipes/namewithversion.pipe';
import { WizardHelper } from '../../../../../../../core/helpers/wizard-helper';

@Component({
  selector: 'app-asset-type-template-wizard-step-start',
  templateUrl: './asset-type-template-wizard-step-start.component.html',
  styleUrls: ['./asset-type-template-wizard-step-start.component.scss']
})
export class AssetTypeTemplateWizardStepStartComponent implements OnInit {

  @Input() assetTypeTemplateForm: FormGroup;
  @Input() isAssetTypeLocked: boolean;

  @Output() stepChange = new EventEmitter<number>();
  @Output() changeUseOfTemplate = new EventEmitter<number>();

  public assetTypes$: Observable<AssetType[]>;
  public assetTypeTemplates$: Observable<AssetTypeTemplate[]>;

  public warningDialogRef: DynamicDialogRef;

  public MAX_TEXT_LENGTH = WizardHelper.MAX_TEXT_LENGTH;

  constructor(private assetTypeQuery: AssetTypeQuery,
              private assetTypeTemplateQuery: AssetTypeTemplateQuery,
              private assetTypesComposedQuery: AssetTypesComposedQuery,
              public ref: DynamicDialogRef,
              public dialogService: DialogService,
              private router: Router,
              public route: ActivatedRoute) { }

  private static addPublishedVersionToAssetTypeTemplateName(assetTypeTemplate: AssetTypeTemplate): AssetTypeTemplate {
    const nameWithVersionPipe = new NameWithVersionPipe();
    const newAssetTypeTemplate = { ...assetTypeTemplate };

    newAssetTypeTemplate.name = nameWithVersionPipe.transform(assetTypeTemplate.name, assetTypeTemplate.publishedVersion);

    return newAssetTypeTemplate;
  }

  ngOnInit() {
    this.assetTypes$ = this.assetTypeQuery.selectAll();
    this.assetTypeTemplates$ = this.assetTypeTemplateQuery.selectAll();

    const assetTypeId = this.assetTypeTemplateForm.get('assetTypeId')?.value;
    if (assetTypeId) {
      this.updateAvailableAssetTypeTemplates(assetTypeId);
    }
  }

  onStart() {
    if (this.assetTypeTemplateForm?.valid) {
      this.existsDraft().then(assetTypeTemplateId => {
        if (assetTypeTemplateId != null) {
          this.showWarningDialog(assetTypeTemplateId);
        } else {
          this.stepChange.emit(AssetTypeTemplateWizardSteps.START + 1);
        }
      });
    }
  }

  private showWarningDialog(assetTypeTemplateId: ID) {
    this.warningDialogRef = this.dialogService.open(AssetTypeTemplateWizardWarningDialogComponent, { width: '70%' });
    this.warningDialogRef.onClose.subscribe((result: boolean | null) => this.onCloseWarningDialog(result, assetTypeTemplateId));
  }

  onCloseWarningDialog(goToDetails: boolean | null, assetTypeTemplateId: ID) {
    if (goToDetails != null && assetTypeTemplateId) {
      this.ref.close();
      this.router.navigate([assetTypeTemplateId], { relativeTo: this.route }).then();
    }
    else {
      this.stepChange.emit(AssetTypeTemplateWizardSteps.START);
    }
  }

  onCancel() {
    this.ref.close();
  }

  onChangeAssetType(assetTypeId: number): void {
    if (!this.isAssetTypeLocked) {
      this.updateAvailableAssetTypeTemplates(assetTypeId);
    }
  }

  private updateAvailableAssetTypeTemplates(assetTypeId: ID): void {
    const assetType = this.assetTypeQuery.getEntity(assetTypeId);
    this.replaceTemplateNameFromAssetType(assetType);
    this.assetTypeTemplates$ = this.assetTypeTemplateQuery.selectAll().
    pipe(map( assetTypeTemplate => assetTypeTemplate.filter(value => value.assetTypeId === assetType.id)
      .map(template => AssetTypeTemplateWizardStepStartComponent.addPublishedVersionToAssetTypeTemplateName(template))));
  }

  private replaceTemplateNameFromAssetType(assetType: AssetType): void {
    if (assetType) {
      this.assetTypeTemplateForm.get('name')?.setValue(assetType.name);
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
