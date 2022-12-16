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
import { FieldTarget, FieldType } from '../../../../core/store/field-target/field-target.model';
import { ActivatedRoute } from '@angular/router';
import { AssetTypeTemplate, PublicationState } from '../../../../core/store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateComposedQuery } from '../../../../core/store/composed/asset-type-template-composed.query';
import { FieldTargetService } from '../../../../core/store/field-target/field-target.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  AssetTypeTemplateDialogPublishComponent
} from '../../content/asset-type-template/asset-type-template-dialog/asset-type-template-dialog-publish/asset-type-template-dialog-publish.component';
import { AssetTypeTemplateService } from '../../../../core/store/asset-type-template/asset-type-template.service';
import {
  AssetTypeTemplateDialogUpdateComponent
} from '../../content/asset-type-template/asset-type-template-dialog/asset-type-template-update-dialog/asset-type-template-dialog-update.component';
import { FormGroup } from '@angular/forms';
import { DialogType } from '../../../../shared/models/dialog-type.model';
import {
  AssetTypeTemplateWizardComponent
} from '../../content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard.component';
import { ID } from '@datorama/akita';

@Component({
  selector: 'app-asset-type-template-page',
  templateUrl: './asset-type-template-page.component.html',
  styleUrls: ['./asset-type-template-page.component.scss']
})
export class AssetTypeTemplatePageComponent implements OnInit {

  private assetTypeTemplateId: ID;
  public assetTypeTemplate: AssetTypeTemplate;
  public metrics: FieldTarget[];
  public attributes: FieldTarget[];

  private publishDialogRef: DynamicDialogRef;
  private updateWizardRef: DynamicDialogRef;
  private warningDialogRef: DynamicDialogRef;

  public FieldType = FieldType;
  public PublicationState = PublicationState;

  constructor(private assetTypeTemplateComposedQuery: AssetTypeTemplateComposedQuery,
              private assetTypeTemplateService: AssetTypeTemplateService,
              private fieldTargetService: FieldTargetService,
              private dialogService: DialogService,
              public route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.metrics = [];
    this.attributes = [];

    this.assetTypeTemplateId = Number.parseInt(this.route.snapshot.paramMap.get('assetTypeTemplateId'), 10);
    this.initAssetTypeTemplate(this.assetTypeTemplateId);

    this.assetTypeTemplateService.setActive(this.assetTypeTemplateId);
  }

  private initAssetTypeTemplate(assetTypeTemplateId: ID) {
    if (assetTypeTemplateId) {
      this.fieldTargetService.getItemsByAssetTypeTemplate(assetTypeTemplateId).subscribe(() =>
        this.assetTypeTemplateComposedQuery.selectAssetTypeTemplate(assetTypeTemplateId)
          .subscribe(assetTypeTemplate => this.updateAssetTypeTemplate(assetTypeTemplate)));
    }
  }

  private updateAssetTypeTemplate(assetTypeTemplate: AssetTypeTemplate) {
    this.assetTypeTemplate = assetTypeTemplate;
    this.metrics = this.getMetrics();
    this.attributes = this.getAttributes();
  }

  private getMetrics(): FieldTarget[] {
    return this.assetTypeTemplate.fieldTargets?.filter((field) => field.fieldType === FieldType.METRIC);
  }

  private getAttributes(): FieldTarget[] {
    return this.assetTypeTemplate.fieldTargets?.filter((field) => field.fieldType === FieldType.ATTRIBUTE);
  }

  onUpdate() {
    this.warningDialogRef = this.dialogService.open(AssetTypeTemplateDialogUpdateComponent, { width: '60%'});
    this.warningDialogRef.onClose.subscribe((callUpdateWizard: boolean) => {
      if (callUpdateWizard) {
        this.showUpdateWizard();
      }
    });
  }

  onPublish() {
    this.publishDialogRef = this.dialogService.open(AssetTypeTemplateDialogPublishComponent,
      {
        header: `Publish ${this.assetTypeTemplate.name}?`,
        data: { assetTypeTemplate: this.assetTypeTemplate},
        width: '70%',
      }
    );
    this.publishDialogRef.onClose.subscribe((assetTypeTemplateForm: FormGroup) =>
      this.onClosePublishDialog(assetTypeTemplateForm));
  }

  private onClosePublishDialog(assetTypeTemplateForm: FormGroup) {
    this.publishAssetTypeTemplate(assetTypeTemplateForm);
  }

  private showUpdateWizard() {
    this.updateWizardRef = this.dialogService.open(AssetTypeTemplateWizardComponent,
      {
        data: { assetTypeTemplate: this.assetTypeTemplate, type: DialogType.EDIT},
        header: 'Asset Type Template Editor',
        width: '70%',
      }
    );
    this.updateWizardRef.onClose.subscribe((assetTypeTemplateFormIfPublished: FormGroup) => {
      if (assetTypeTemplateFormIfPublished) {
        this.publishAssetTypeTemplate(assetTypeTemplateFormIfPublished);
      } else {
        this.initAssetTypeTemplate(this.assetTypeTemplateId);
      }
    });
  }

  private publishAssetTypeTemplate(assetTypeTemplateForm: FormGroup) {
    if (assetTypeTemplateForm && assetTypeTemplateForm.get('wasPublished')?.value) {
      this.assetTypeTemplate.publicationState = assetTypeTemplateForm.get('publicationState')?.value;
      this.assetTypeTemplate.publishedDate = assetTypeTemplateForm.get('publishedDate')?.value;
      this.assetTypeTemplate.publishedVersion = assetTypeTemplateForm.get('publishedVersion')?.value;
      this.assetTypeTemplateService.editItem(this.assetTypeTemplate.id, this.assetTypeTemplate).subscribe();
    }
  }
}
