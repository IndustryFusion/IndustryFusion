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
import { AssetType } from '../../../../store/asset-type/asset-type.model';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { AssetTypeQuery } from '../../../../store/asset-type/asset-type.query';
import { ActivatedRoute } from '@angular/router';
import { AssetTypeTemplate } from '../../../../store/asset-type-template/asset-type-template.model';
import { AssetTypesComposedQuery } from '../../../../store/composed/asset-types-composed.query';
import { EcoSystemManagerResolver } from '../../../services/ecosystem-resolver.service';
import { AssetTypeService } from '../../../../store/asset-type/asset-type.service';
import { DialogService } from 'primeng/dynamicdialog';
import { AssetTypeEditDialogComponent } from '../../content/asset-type-edit/asset-type-edit-dialog.component';

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
              private ecoSystemManagerResolver: EcoSystemManagerResolver,
              public dialogService: DialogService) { }

  ngOnInit(): void {
    this.isLoading$ = this.assetTypeQuery.selectLoading();
    this.resolve(this.activatedRoute);
    this.ecoSystemManagerResolver.resolve(this.activatedRoute);
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
    }
  }

  showEditDialog(): void {
    let assetType: AssetType;
    this.assetType$.subscribe(x => assetType = x);

    this.dialogService.open(AssetTypeEditDialogComponent, {
      data: {
        assetType
      },
      header: `Edit Asset type (${assetType?.name})`,
    });
  }
}
