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
import { EcoSystemManagerResolver } from '../../../services/ecosystem-resolver.service';
import { ActivatedRoute } from '@angular/router';
import { AssetTypeTemplate } from '../../../../store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateComposedQuery } from '../../../../store/composed/asset-type-template-composed.query';
import { FieldTargetService } from '../../../../store/field-target/field-target.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AssetTypeTemplateDialogPublishComponent } from '../../content/asset-type-template/asset-type-template-dialog/asset-type-template-dialog-publish/asset-type-template-dialog-publish.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetTypeTemplateService } from '../../../../store/asset-type-template/asset-type-template.service';
import { AssetTypeTemplateDialogUpdateComponent } from '../../content/asset-type-template/asset-type-template-dialog/asset-type-template-update-dialog/asset-type-template-dialog-update.component';
import { AssetTypeTemplateWizardMainComponent } from '../../content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-main/asset-type-template-wizard-main.component';

@Component({
  selector: 'app-asset-type-template-page',
  templateUrl: './asset-type-template-page.component.html',
  styleUrls: ['./asset-type-template-page.component.scss']
})
export class AssetTypeTemplatePageComponent implements OnInit {

  constructor(private ecoSystemManagerResolver: EcoSystemManagerResolver, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.ecoSystemManagerResolver.resolve(this.activatedRoute);
  }

  private getMetrics(): FieldTarget[] {
    return this.assetTypeTemplate.fieldTargets?.filter((field) => field.fieldType === FieldType.METRIC);
  }

  private getAttributes(): FieldTarget[] {
    return this.assetTypeTemplate.fieldTargets?.filter((field) => field.fieldType === FieldType.ATTRIBUTE);
  }

  onEdit() {
    this.editDialogRef = this.dialogService.open(AssetTypeTemplateDialogUpdateComponent, { width: '60%' } );
    this.editDialogRef.onClose.subscribe((edit: boolean) => this.onCloseUpdateDialog(edit));
  }

  private createAssetTypeTemplateForm(formBuilder: FormBuilder) {
    // TODO: duplicated code, ineffective
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    this.assetTypeTemplateForm = formBuilder.group({
      id: [],
      name: ['', requiredTextValidator],
      description: ['', Validators.maxLength(255)],
      published: [false],
      useExistingTemplate: [false, Validators.required],
      assetTypeId: [undefined, Validators.required],
      assetTypeTemplateId: [],
      metric: [],
      draftVersion: []
    });
    this.assetTypeTemplateForm.patchValue(this.assetTypeTemplate);
  }

  onPublish() {
    this.publishDialogRef = this.dialogService.open(AssetTypeTemplateDialogPublishComponent,
      {
        header: `Publish ${this.assetTypeTemplate.name}?`,
        width: '70%',
      }
    );
    this.publishDialogRef.onClose.subscribe((published: boolean) => this.onClosePublishDialog(published));
  }

  private onClosePublishDialog(published: boolean) {
    if (published) {
      this.assetTypeTemplate.published = true;
      this.assetTypeTemplate.publishedDate = new Date();
      this.assetTypeTemplateService.editItem(this.assetTypeTemplate.id, this.assetTypeTemplate).subscribe();
    }
  }

  private onCloseUpdateDialog(edit: boolean) {
    if (edit) {
      this.createAssetTypeTemplateForm(this.formBuilder);
      this.editDialogRef = this.dialogService.open(AssetTypeTemplateWizardMainComponent,
        {
          data: { assetTypeTemplateForm: this.assetTypeTemplateForm, isEditing: true },
          header: 'Asset Type Template Editor',
          width: '70%',
        }
      );
      this.editDialogRef.onClose.subscribe((published: boolean) => this.onClosePublishDialog(published));
    }
  }
}
