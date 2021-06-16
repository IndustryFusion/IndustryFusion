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

import { BaseListComponent } from '../../base/base-list/base-list.component';
import { AssetTypeTemplateQuery } from '../../../../../store/asset-type-template/asset-type-template.query';
import { AssetTypeTemplateService } from '../../../../../store/asset-type-template/asset-type-template.service';
import { Observable } from 'rxjs';
import { AssetTypeTemplate } from '../../../../../store/asset-type-template/asset-type-template.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormGroup } from '@angular/forms';
import { AssetTypeTemplateWizardMainComponent } from '../asset-type-template-wizard/asset-type-template-wizard-main/asset-type-template-wizard-main.component';

@Component({
  selector: 'app-asset-type-template-list',
  templateUrl: './asset-type-template-list.component.html',
  styleUrls: ['./asset-type-template-list.component.scss'],
  providers: [DialogService]
})
export class AssetTypeTemplateListComponent extends BaseListComponent implements OnInit, OnDestroy {

  @Input()
  optionalItems$: Observable<AssetTypeTemplate[]>;

  public titleMapping:
    { [k: string]: string } = { '=0': 'No asset type templates.', '=1': '# Asset type template', other: '# Asset type templates' };

  public editBarMapping:
    { [k: string]: string } = {
      '=0': 'No asset type templates selected',
      '=1': '# Asset type template selected',
      other: '# Asset type templates selected'
    };

  public createWizardRef: DynamicDialogRef;
  public assetTypeTemplateForm: FormGroup;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public assetTypeTemplateQuery: AssetTypeTemplateQuery,
    public assetTypeTemplateService: AssetTypeTemplateService,
    public dialogService: DialogService) {
      super(route, router, assetTypeTemplateQuery, assetTypeTemplateService);
     }

  ngOnInit() {
    super.ngOnInit();

    if (this.optionalItems$ != null) {
       this.items$ = this.optionalItems$;
    }
  }

  onCreate() {
    this.createWizardRef = this.dialogService.open(AssetTypeTemplateWizardMainComponent, {
      data: {
        isEditing: false
      },
      header: `Asset Type Template Editor`,
      width: '90%'
    });
  }

  ngOnDestroy() {
    if (this.createWizardRef) {
      this.createWizardRef.close();
    }
    this.assetTypeTemplateQuery.resetError();
  }
}
