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
import { FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-asset-type-edit',
  templateUrl: './asset-type-edit.component.html',
  styleUrls: ['./asset-type-edit.component.scss']
})
export class AssetTypeEditComponent implements OnInit {

  public assetTypeForm: FormGroup;

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig) { }

  ngOnInit() {
    this.assetTypeForm = this.config.data.assetTypeForm;
    this.assetTypeForm.get('description').setValue(this.assetTypeForm.get('description').value);
  }

  onCancel() {
    this.ref.close();
  }

  onSave() {
    // TODO: Input validation
    if (this.assetTypeForm.valid) {
      const assetType = new AssetType();
      assetType.id = this.assetTypeForm.get('id')?.value;
      assetType.name = this.assetTypeForm.get('name')?.value;
      assetType.label = this.assetTypeForm.get('label')?.value;
      assetType.description = this.assetTypeForm.get('description')?.value;
      this.ref.close(assetType);
    } else {
      this.ref.close();
    }
  }
}
