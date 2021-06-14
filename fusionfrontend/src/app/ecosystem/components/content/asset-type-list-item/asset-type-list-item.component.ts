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
import { BaseListItemComponent } from '../base/base-list-item/base-list-item.component';
import { AssetTypeService } from '../../../../store/asset-type/asset-type.service';
import { AssetTypeDetails } from '../../../../store/asset-type-details/asset-type-details.model';
import { DialogService } from 'primeng/dynamicdialog';
import { AssetType } from '../../../../store/asset-type/asset-type.model';
import { AssetTypeEditDialogComponent } from '../asset-type-edit/asset-type-edit-dialog.component';

@Component({
  selector: 'app-asset-type-list-item',
  templateUrl: './asset-type-list-item.component.html',
  styleUrls: ['./asset-type-list-item.component.scss'],
  providers: [DialogService]
})
export class AssetTypeListItemComponent extends BaseListItemComponent implements OnInit {

  @Input()  item: AssetTypeDetails;

  constructor(public route: ActivatedRoute,
              public router: Router,
              public assetTypeService: AssetTypeService,
              private dialogService: DialogService) {
    super(route, router, assetTypeService);
  }

  private static assetTypeFromDetails(assetTypeDetails: AssetTypeDetails): AssetType {
    const assetType: AssetType = new AssetType();
    assetType.id = assetTypeDetails.id;
    assetType.name = assetTypeDetails.name;
    assetType.label = assetTypeDetails.label;
    assetType.description = assetTypeDetails.description;

    return assetType;
  }

  ngOnInit() {
    super.ngOnInit();
  }

  showEditDialog(): void {
    const assetType: AssetType = AssetTypeListItemComponent.assetTypeFromDetails(this.item);

    const ref = this.dialogService.open(AssetTypeEditDialogComponent, {
      data: {
        assetType
      },
      header: `Edit Asset type (${assetType?.name})`,
    });

    ref.onClose.subscribe(value => this.updateUI(value));
  }

  updateUI(assetType: AssetType) {
    const assetTypeDetails = new AssetTypeDetails();

    assetTypeDetails.id = assetType.id;
    assetTypeDetails.name = assetType.name;
    assetTypeDetails.label = assetType.label;
    assetTypeDetails.description = assetType.description;
    assetTypeDetails.templateCount = this.item.templateCount;
    assetTypeDetails.assetSeriesCount = this.item.assetSeriesCount;
    assetTypeDetails.assetCount = this.item.assetCount;

    this.item = assetTypeDetails;
  }
}
