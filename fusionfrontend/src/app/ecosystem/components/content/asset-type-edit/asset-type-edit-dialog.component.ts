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
import { AssetType } from '../../../../store/asset-type/asset-type.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AssetTypeDetails } from '../../../../store/asset-type-details/asset-type-details.model';
import { AssetTypeService } from '../../../../store/asset-type/asset-type.service';

@Component({
  selector: 'app-asset-type-edit-dialog',
  templateUrl: './asset-type-edit-dialog.component.html',
  styleUrls: ['./asset-type-edit-dialog.component.scss']
})
export class AssetTypeEditDialogComponent implements OnInit {

  public assetTypeForm: FormGroup;

  constructor(private assetTypeService: AssetTypeService,
              private formBuilder: FormBuilder,
              public ref: DynamicDialogRef,
              public config: DynamicDialogConfig) { }

  ngOnInit() {
    this.createAssetTypeForm(this.config.data.assetType);
    this.assetTypeForm.get('description').setValue(this.assetTypeForm.get('description').value);
  }

  onCancel() {
    this.ref.close();
  }

  onSave() {
    if (this.assetTypeForm.valid) {
      const assetType = new AssetType();
      assetType.id = this.assetTypeForm.get('id')?.value;
      assetType.name = this.assetTypeForm.get('name')?.value;
      assetType.label = this.assetTypeForm.get('label')?.value;
      assetType.description = this.assetTypeForm.get('description')?.value;

      this.assetTypeService.editItem(assetType.id, assetType).subscribe();
      //  this.assetTypeDetailsService.getItem(assetType.id).subscribe();

      this.ref.close(assetType);
    }
  }

  private createAssetTypeForm(assetTypeToEdit: AssetTypeDetails) {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];

    this.assetTypeForm = this.formBuilder.group({
      id: [],
      name: ['', requiredTextValidator],
      label: ['', requiredTextValidator],
      description: ['', Validators.maxLength(255)]
    });

    if (assetTypeToEdit) {
      this.assetTypeForm.patchValue(assetTypeToEdit);
    }
  }

}
