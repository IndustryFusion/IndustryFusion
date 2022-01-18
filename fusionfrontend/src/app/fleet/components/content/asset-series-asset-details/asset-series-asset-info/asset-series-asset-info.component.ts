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
import { ItemOptionsMenuType } from '../../../../../shared/components/ui/item-options-menu/item-options-menu.type';
import { Observable } from 'rxjs';
import { CompanyQuery } from '../../../../../core/store/company/company.query';
import { ID } from '@datorama/akita';
import { AssetService } from '../../../../../core/store/asset/asset.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FleetAssetDetailsWithFields } from '../../../../../core/store/fleet-asset-details/fleet-asset-details.model';
import { FleetAssetDetailMenuService } from '../../../../../core/services/menu/fleet-asset-detail-menu.service';
import { ImageStyleType } from 'src/app/shared/models/image-style-type.model';

@Component({
  selector: 'app-asset-series-asset-info',
  templateUrl: './asset-series-asset-info.component.html',
  styleUrls: ['./asset-series-asset-info.component.scss']
})
export class AssetSeriesAssetInfoComponent implements OnInit {

  @Input()
  assetWithFields$: Observable<FleetAssetDetailsWithFields>;

  assetWithFields: FleetAssetDetailsWithFields;

  ItemOptionsMenuType = ItemOptionsMenuType;
  ImageStyleType = ImageStyleType;

  constructor(private companyQuery: CompanyQuery,
              private assetService: AssetService,
              private router: Router,
              private routingLocation: Location,
              private fleetAssetDetailMenuService: FleetAssetDetailMenuService) {
  }

  ngOnInit() {
    this.assetWithFields$.subscribe(asset => {
      this.assetWithFields = asset;
    });
  }

  openEditWizard() {
    this.fleetAssetDetailMenuService.showEditWizardAndRefresh(this.assetWithFields);
  }

  openDeleteDialog() {
    this.fleetAssetDetailMenuService.showDeleteDialog('asset-series-asset-delete-dialog-detail',
      this.assetWithFields.name, () => this.deleteAsset(this.assetWithFields.id));
  }

  private deleteAsset(id: ID) {
    this.assetService.removeCompanyAsset(this.companyQuery.getActiveId(), id).subscribe(() => {
      const currentUrlSeparated = this.routingLocation.path().split('/');
      const newRoutingLocation = currentUrlSeparated.slice(0, currentUrlSeparated.findIndex(elem => elem === 'assets') + 1);
      this.router.navigateByUrl(newRoutingLocation.join('/')).catch(error => console.warn('Routing error: ', error));
    });
  }
}
