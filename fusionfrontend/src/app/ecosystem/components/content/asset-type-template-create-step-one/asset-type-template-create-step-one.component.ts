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

import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ID } from '@datorama/akita';

import { Observable } from 'rxjs';

import { AssetType } from '../../../../store/asset-type/asset-type.model';
import { AssetTypeQuery } from '../../../../store/asset-type/asset-type.query';
import { AssetTypeService } from '../../../../store/asset-type/asset-type.service';

@Component({
  selector: 'app-asset-type-template-create-step-one',
  templateUrl: './asset-type-template-create-step-one.component.html',
  styleUrls: ['./asset-type-template-create-step-one.component.scss']
})
export class AssetTypeTemplateCreateStepOneComponent implements OnInit {

  @Output() stepChange = new EventEmitter<number>();
  @Output() assetTypeSelect = new EventEmitter<ID>();
  @Output() nameSelect = new EventEmitter<string>();
  @Output() descriptionSelect = new EventEmitter<string>();
  @Output() errorSignal = new EventEmitter<string>();

  assetTypes$: Observable<AssetType[]>;
  assetType: ID;
  startConfiguration: string;
  name: string;
  description: string;

  shouldShowCreateAssetType = false;

  constructor(private assetTypeQuery: AssetTypeQuery,
              private route: ActivatedRoute,
              private router: Router,
              private assetTypeService: AssetTypeService) { }

  ngOnInit() {
    this.assetTypes$ = this.assetTypeQuery.selectAll();
  }

  changeStep() {
    if (this.assetType && this.startConfiguration) {
      this.assetTypeSelect.emit(this.assetType);
      if (this.startConfiguration === 'blankPage') {
        this.nameSelect.emit(this.name);
        this.descriptionSelect.emit(this.description);
      }
      this.stepChange.emit(2);
    } else {
      this.errorSignal.emit('Asset type is required. Choosing option is required.');
    }
  }

  cancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  createAssetTypeModal() {
    this.shouldShowCreateAssetType = true;
  }

  onDismissModal() {
    this.shouldShowCreateAssetType = false;
  }

  onConfirmModal(item: any) {
    this.assetTypeService.createItem(item).subscribe();
    this.shouldShowCreateAssetType = false;
  }

}
