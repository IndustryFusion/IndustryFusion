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
import { AssetWizardComponent } from '../../asset-wizard/asset-wizard.component';
import { DialogService } from 'primeng/dynamicdialog';
import { CompanyQuery } from '../../../../../store/company/company.query';
import { ID } from '@datorama/akita';
import { ConfirmationService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetSeriesService } from '../../../../../store/asset-series/asset-series.service';
import { Location } from '@angular/common';
import { AssetSeriesWizardComponent } from '../../asset-series-wizard/asset-series-wizard.component';
import { AssetSeriesDetailsResolver } from '../../../../../resolvers/asset-series-details-resolver.service';
import { AssetSeriesDetailsService } from '../../../../../store/asset-series-details/asset-series-details.service';

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
              private route: ActivatedRoute,
              private routingLocation: Location,
              private dialogService: DialogService,
              private confirmationService: ConfirmationService,
              private assetSeriesService: AssetSeriesService,
              private assetSeriesDetailsService: AssetSeriesDetailsService,
              private assetSeriesDetailsResolver: AssetSeriesDetailsResolver,
              private companyQuery: CompanyQuery) {
  }

  ngOnInit() {
  }

  createAssetFromAssetSeries() {
    this.dialogService.open(AssetWizardComponent, {
      data: {
        companyId: this.companyQuery.getActiveId(),
        prefilledAssetSeriesId: this.assetSeries.id,
      },
      header: 'Digital Twin Creator for Assets',
      width: '80%'
    });
  }

  showDeleteDialog() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the Asset Serie ' + this.assetSeries.name + '?',
      header: 'Delete Asset Serie Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteItem(this.assetSeries.id);
      },
      reject: () => {
      }
    });
  }

  showAssetSeriesEditWizard() {
    const dynamicDialogRef = this.dialogService.open(AssetSeriesWizardComponent, {
      data: {
        companyId: this.companyQuery.getActiveId(),
        assetSeriesId: this.assetSeries.id.toString(),
      },
      width: '90%',
      header: 'AssetSeries Implementation',
    });
    dynamicDialogRef.onClose.subscribe(() => {
      this.assetSeriesDetailsResolver.resolve(this.route.snapshot);
      this.assetSeriesDetailsService.setActive(this.assetSeries.id);
    });
  }

  private deleteItem(id: ID) {
    this.assetSeriesService.deleteItem(this.companyQuery.getActiveId(), id).subscribe(() => {
      const currentUrlSeparated = this.routingLocation.path().split('/');
      const newRoutingLocation = currentUrlSeparated.slice(0, currentUrlSeparated.findIndex(elem => elem === 'assetseries') + 1);
      this.router.navigateByUrl(newRoutingLocation.join('/')).catch(error => console.warn('Routing error: ', error));
    });
  }
}
