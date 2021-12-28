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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { AssetType } from '../../../../core/store/asset-type/asset-type.model';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { AssetTypeQuery } from '../../../../core/store/asset-type/asset-type.query';
import { ActivatedRoute } from '@angular/router';
import { AssetTypeTemplate } from '../../../../core/store/asset-type-template/asset-type-template.model';
import { AssetTypesComposedQuery } from '../../../../core/store/composed/asset-types-composed.query';
import { AssetTypeService } from '../../../../core/store/asset-type/asset-type.service';
import { DialogService } from 'primeng/dynamicdialog';
import { AssetTypeDialogComponent } from '../../content/asset-type-dialog/asset-type-dialog.component';
import { DialogType } from '../../../../shared/models/dialog-type.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-asset-type-details-page',
  templateUrl: './asset-type-page.component.html',
  styleUrls: ['./asset-type-page.component.scss']
})
export class AssetTypePageComponent implements OnInit, OnDestroy {

  assetTypeId: ID;
  assetType$: Observable<AssetType>;
  assetTypeTemplates$: Observable<AssetTypeTemplate[]>;

  isLoading$: Observable<boolean>;

  constructor(private assetTypeQuery: AssetTypeQuery,
              private assetTypeService: AssetTypeService,
              private activatedRoute: ActivatedRoute,
              private assetTypesComposedQuery: AssetTypesComposedQuery,
              public dialogService: DialogService,
              private translate: TranslateService) { }

  ngOnInit(): void {
    this.isLoading$ = this.assetTypeQuery.selectLoading();
    this.resolve(this.activatedRoute);
    this.assetTypeTemplates$ = this.assetTypesComposedQuery.selectTemplatesOfAssetType(this.assetTypeId);
  }

  ngOnDestroy(): void {
    this.assetTypeQuery.resetError();
  }

  resolve(activatedRoute: ActivatedRoute): void {
    const assetTypeId = activatedRoute.snapshot.paramMap.get('assettypeId');
    if (assetTypeId != null) {
      this.assetType$ = this.assetTypeQuery.selectAssetType(assetTypeId);
      this.assetTypeId = assetTypeId;
      this.assetTypeService.setActive(assetTypeId);
    } else {
    }
  }

  showEditDialog(): void {
    let assetType: AssetType;
    this.assetType$.subscribe(x => assetType = x);

    this.dialogService.open(AssetTypeDialogComponent, {
      data: {
        assetType, dialogType: DialogType.EDIT
      },
      header: this.translate.instant('APP.ECOSYSTEM.PAGES.ASSET_TYPE.EDIT_ASSET_TYPE', { assetTypeName:  assetType?.name  }),
    });
  }
}
