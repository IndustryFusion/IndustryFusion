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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseListItemComponent } from '../base/base-list-item/base-list-item.component';
import { AssetTypeService } from '../../../../store/asset-type/asset-type.service';
import { AssetTypeDetails } from '../../../../store/asset-type-details/asset-type-details.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AssetType } from '../../../../store/asset-type/asset-type.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AssetTypeEditComponent } from '../asset-type-edit/asset-type-edit.component';


@Component({
  selector: 'app-asset-type-list-item',
  templateUrl: './asset-type-list-item.component.html',
  styleUrls: ['./asset-type-list-item.component.scss'],
  providers: [DialogService]
})
export class AssetTypeListItemComponent extends BaseListItemComponent implements OnInit, OnDestroy {

  @Input()
  public item: AssetTypeDetails;

  public assetTypeForm: FormGroup;
  public ref: DynamicDialogRef;

  constructor(public route: ActivatedRoute,
              public router: Router,
              public assetTypeService: AssetTypeService,
              private formBuilder: FormBuilder,
              public dialogService: DialogService) {
    super(route, router, assetTypeService);
  }

  ngOnInit() {
    this.createAssetTypeForm(this.formBuilder, this.item);
  }

  showEditDialog() {
      this.assetTypeService.setActive(this.item.id);
      const ref = this.dialogService.open(AssetTypeEditComponent, {
        data: {
          assetTypeForm: this.assetTypeForm
        },
        header: `Edit Asset type (${this.assetTypeForm.get('name').value})`,
      });

      ref.onClose.subscribe((assetType: AssetType) => this.onCloseEditDialog(assetType));
  }

  createAssetTypeForm(formBuilder: FormBuilder, assetTypeToEdit: AssetTypeDetails) {
    this.assetTypeForm = formBuilder.group({
      id: assetTypeToEdit ? new FormControl(assetTypeToEdit.id) : new FormControl(null),
      name: assetTypeToEdit ? new FormControl(assetTypeToEdit.name) : new FormControl(null),
      label: assetTypeToEdit ? new FormControl(assetTypeToEdit.label) : new FormControl(null),
      description: assetTypeToEdit ? new FormControl(assetTypeToEdit.description) : new FormControl(null),
    });
  }

  onCloseEditDialog(item: AssetType) {
    if (item) {
      this.assetTypeService.editItem(item.id, item).subscribe();
      this.updateUI(item);
    }
    this.assetTypeService.setActive(this.item.id);
  }

  updateUI(assetType: AssetType) {
    const assetTypeDetails: AssetTypeDetails = new AssetTypeDetails();

    assetTypeDetails.id = this.item.id;
    assetTypeDetails.name = assetType.name;
    assetTypeDetails.label = assetType.label;
    assetTypeDetails.description = assetType.description;
    assetTypeDetails.templateCount = this.item.templateCount;
    assetTypeDetails.assetSeriesCount = this.item.assetSeriesCount;
    assetTypeDetails.assetCount = this.item.assetCount;

    this.item = assetTypeDetails;
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
