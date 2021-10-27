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
import { AssetSeriesDetails } from '../../../../../store/asset-series-details/asset-series-details.model';
import { ItemOptionsMenuType } from '../../../../../components/ui/item-options-menu/item-options-menu.type';
import { CompanyQuery } from '../../../../../store/company/company.query';
import { ID } from '@datorama/akita';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { AssetSeriesService } from '../../../../../store/asset-series/asset-series.service';
import { Location } from '@angular/common';
import { AssetSeriesDetailsResolver } from '../../../../../resolvers/asset-series-details-resolver';
import { AssetSeriesDetailsService } from '../../../../../store/asset-series-details/asset-series-details.service';
import { AssetSeriesDetailMenuService } from '../../../../../services/menu/asset-series-detail-menu.service';

@Component({
  selector: 'app-asset-series-details-info',
  templateUrl: './asset-series-details-info.component.html',
  styleUrls: ['./asset-series-details-info.component.scss']
})
export class AssetSeriesDetailsInfoComponent implements OnInit {

  @Input()
  assetSeries: AssetSeriesDetails;

  dropdownMenuOptions: ItemOptionsMenuType[] = [ItemOptionsMenuType.CREATE, ItemOptionsMenuType.EDIT, ItemOptionsMenuType.DELETE];

  constructor(private router: Router,
              private routingLocation: Location,
              private confirmationService: ConfirmationService,
              private assetSeriesDetailMenuService: AssetSeriesDetailMenuService,
              private assetSeriesService: AssetSeriesService,
              private assetSeriesDetailsService: AssetSeriesDetailsService,
              private assetSeriesDetailsResolver: AssetSeriesDetailsResolver,
              private companyQuery: CompanyQuery) {
  }

  ngOnInit() {
  }

  openCreateWizard() {
    this.assetSeriesDetailMenuService.showCreateAssetFromAssetSeries(this.assetSeries.id.toString(), () => { });
  }

  openEditWizard() {
    this.assetSeriesDetailMenuService.showEditWizard(this.assetSeries.id.toString(), () => {
      this.assetSeriesDetailsResolver.resolveFromComponent().subscribe();
      this.assetSeriesDetailsService.setActive(this.assetSeries.id);
    });
  }

  openDeleteDialog() {
    this.assetSeriesDetailMenuService.showDeleteDialog(this.confirmationService, 'asset-series-delete-dialog-detail',
      this.assetSeries.name, () => this.deleteAssetSeries(this.assetSeries.id));
  }

  private deleteAssetSeries(id: ID) {
    this.assetSeriesService.deleteItem(this.companyQuery.getActiveId(), id).subscribe(() => {
      const currentUrlSeparated = this.routingLocation.path().split('/');
      const newRoutingLocation = currentUrlSeparated.slice(0, currentUrlSeparated.findIndex(elem => elem === 'assetseries') + 1);
      this.router.navigateByUrl(newRoutingLocation.join('/')).catch(error => console.warn('Routing error: ', error));
    });
  }

}
