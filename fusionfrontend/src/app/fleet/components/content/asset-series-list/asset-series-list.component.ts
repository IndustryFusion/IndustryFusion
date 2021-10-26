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
import { ActivatedRoute } from '@angular/router';
import { AssetSeriesDetailsQuery } from '../../../../store/asset-series-details/asset-series-details.query';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { AssetSeriesDetailsResolver } from '../../../../resolvers/asset-series-details-resolver.service';
import { AssetSeriesService } from '../../../../store/asset-series/asset-series.service';
import { DialogService } from 'primeng/dynamicdialog';
import { AssetSeriesWizardComponent } from '../asset-series-wizard/asset-series-wizard.component';
import { CompanyQuery } from '../../../../store/company/company.query';
import { AssetTypeTemplatesResolver } from '../../../../resolvers/asset-type-templates.resolver';
import { UnitsResolver } from '../../../../resolvers/units.resolver';
import { AssetSeriesDetails } from '../../../../store/asset-series-details/asset-series-details.model';
import { ItemOptionsMenuType } from '../../../../components/ui/item-options-menu/item-options-menu.type';
import { ConfirmationService } from 'primeng/api';
import { AssetSeriesDetailMenuService } from '../../../../services/menu/asset-series-detail-menu.service';

@Component({
  selector: 'app-asset-series-list',
  templateUrl: './asset-series-list.component.html',
  styleUrls: ['./asset-series-list.component.scss'],
  providers: [ConfirmationService]
})
export class AssetSeriesListComponent implements OnInit, OnDestroy {

  assetSeriesMapping:
    { [k: string]: string } = { '=0': 'No asset series', '=1': '# Asset series', other: '# Asset series' };

  activeListItem: AssetSeriesDetails;

  assetSeries$: Observable<AssetSeriesDetails[]>;
  assetSeries: AssetSeriesDetails[];
  displayedAssetSeries: AssetSeriesDetails[];
  assetSeriesSearchedByName: AssetSeriesDetails[];

  ItemOptionsMenuType = ItemOptionsMenuType;

  isLoading$: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private companyQuery: CompanyQuery,
    private assetSeriesService: AssetSeriesService,
    private assetSeriesDetailsQuery: AssetSeriesDetailsQuery,
    private assetSeriesDetailsResolver: AssetSeriesDetailsResolver,
    private assetTypeTemplatesResolver: AssetTypeTemplatesResolver,
    private unitsResolver: UnitsResolver,
    private dialogService: DialogService,
    private assetSeriesDetailMenuService: AssetSeriesDetailMenuService,
    private confirmationService: ConfirmationService) {
  }

  ngOnInit() {
    this.assetSeriesDetailsResolver.resolve(this.route.snapshot);
    this.assetSeries$ = this.assetSeriesDetailsQuery.selectAll();
    this.assetTypeTemplatesResolver.resolve().subscribe();
    this.unitsResolver.resolve().subscribe();
    this.assetSeries$.subscribe(assetSeries => {
      this.assetSeries = this.displayedAssetSeries = this.assetSeriesSearchedByName = assetSeries;
    });
  }

  ngOnDestroy() {
  }

  setActiveRow(assetSeries: AssetSeriesDetails) {
    this.activeListItem = assetSeries;
  }

  createAssetSeries() {
    this.openAssetSeriesWizard('');
  }

  searchAssetSeriesByName(event?: AssetSeriesDetails[]) {
    this.assetSeriesSearchedByName = event;
    this.updateDisplayedAssetSeries();
  }

  updateDisplayedAssetSeries() {
    this.displayedAssetSeries = this.assetSeries.filter(assetSerie => this.assetSeriesSearchedByName.includes(assetSerie));
  }

  createAssetFromAssetSeries(assetSeriesId: ID) {
    this.assetSeriesDetailMenuService.showCreateAssetFromAssetSeries(assetSeriesId.toString(),
      () => this.assetSeriesDetailsResolver.resolve(this.route.snapshot));
  }

  editAssetSeries(assetSeriesId: ID) {
    this.assetSeriesDetailMenuService.showEditWizard(assetSeriesId.toString(),
      () => this.assetSeriesDetailsResolver.resolve(this.route.snapshot));
  }

  private openAssetSeriesWizard(idString: string) {
    const dynamicDialogRef = this.dialogService.open(AssetSeriesWizardComponent, {
      data: {
        companyId: this.companyQuery.getActiveId(),
        assetSeriesId: idString,
      },
      width: '90%',
      header: 'AssetSeries Implementation',
    });
    dynamicDialogRef.onClose.subscribe(() => this.assetSeriesDetailsResolver.resolve(this.route.snapshot));
  }

  showDeleteDialog() {
    this.assetSeriesDetailMenuService.showDeleteDialog(this.confirmationService, 'asset-series-delete-dialog',
      this.activeListItem.name, () => this.deleteItem(this.activeListItem.id));
  }

  private deleteItem(id: ID) {
    this.assetSeriesService.deleteItem(this.route.snapshot.params.companyId, id).subscribe();
  }

}
