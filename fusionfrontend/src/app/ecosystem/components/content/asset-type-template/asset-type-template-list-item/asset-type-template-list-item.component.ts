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

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseListItemComponent } from '../../base/base-list-item/base-list-item.component';
import { AssetTypeTemplate } from '../../../../../store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateService } from '../../../../../store/asset-type-template/asset-type-template.service';
import { AssetTypeTemplateWizardMainComponent } from '../asset-type-template-wizard/asset-type-template-wizard-main/asset-type-template-wizard-main.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ItemOptionsMenuType } from '../../../../../components/ui/item-options-menu/item-options-menu.type';
import { AssetTypeTemplateDialogUpdateComponent } from '../asset-type-template-dialog/asset-type-template-update-dialog/asset-type-template-dialog-update.component';
import { FormGroup } from '@angular/forms';
import { DialogType } from '../../../../../common/models/dialog-type.model';

@Component({
  selector: 'app-asset-type-template-list-item',
  templateUrl: './asset-type-template-list-item.component.html',
  styleUrls: ['./asset-type-template-list-item.component.scss']
})
export class AssetTypeTemplateListItemComponent extends BaseListItemComponent implements OnInit {

  @Input() item: AssetTypeTemplate;

  public menuType: ItemOptionsMenuType;

  private updateWizardRef: DynamicDialogRef;
  private warningDialogRef: DynamicDialogRef;

  constructor(public route: ActivatedRoute,
              public router: Router,
              public assetTypeTemplateService: AssetTypeTemplateService,
              public dialogService: DialogService) {
    super(route, router, assetTypeTemplateService);
  }

  ngOnInit() {
    this.menuType = this.item.published ? ItemOptionsMenuType.DELETE : ItemOptionsMenuType.UPDATE_DELETE;
  }

  onUpdate() {
    this.warningDialogRef = this.dialogService.open(AssetTypeTemplateDialogUpdateComponent, { width: '60%' } );
    this.warningDialogRef.onClose.subscribe((callUpdateWizard: boolean) => {
      if (callUpdateWizard) {
        this.showUpdateWizard();
      }
    });
  }

  private showUpdateWizard() {
    this.updateWizardRef = this.dialogService.open(AssetTypeTemplateWizardMainComponent,
      {
        data: { assetTypeTemplate: this.item, type: DialogType.EDIT },
        header: 'Asset Type Template Editor',
        width: '70%',
      }
    );
    this.updateWizardRef.onClose.subscribe((assetTypeTemplateForm: FormGroup) =>
      this.onCloseUpdateWizard(assetTypeTemplateForm));
  }

  private onCloseUpdateWizard(assetTypeTemplateForm: FormGroup) {
    if (assetTypeTemplateForm && assetTypeTemplateForm.get('wasPublished')?.value) {
      this.item.published = assetTypeTemplateForm.get('published')?.value;
      this.item.publishedDate = assetTypeTemplateForm.get('publishedDate')?.value;
      this.item.publishedVersion = assetTypeTemplateForm.get('publishedVersion')?.value;
      this.menuType = ItemOptionsMenuType.DELETE;
      this.assetTypeTemplateService.editItem(this.item.id, this.item).subscribe();
    }
  }
}
