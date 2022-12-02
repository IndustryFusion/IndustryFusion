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
import { ActivatedRoute, Router } from '@angular/router';
import { AssetSeriesDetailsQuery } from '../../../../core/store/asset-series-details/asset-series-details.query';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { AssetSeriesDetailsResolver } from '../../../../core/resolvers/asset-series-details.resolver';
import { AssetSeriesService } from '../../../../core/store/asset-series/asset-series.service';
import { DialogService } from 'primeng/dynamicdialog';
import { AssetSeriesWizardComponent } from '../asset-series-wizard/asset-series-wizard.component';
import { CompanyQuery } from '../../../../core/store/company/company.query';
import { AssetTypeTemplatesResolver } from '../../../../core/resolvers/asset-type-templates.resolver';
import { UnitsResolver } from '../../../../core/resolvers/units.resolver';
import { AssetSeriesDetails } from '../../../../core/store/asset-series-details/asset-series-details.model';
import { ItemOptionsMenuType } from '../../../../shared/components/ui/item-options-menu/item-options-menu.type';
import { ConfirmationService } from 'primeng/api';
import { AssetSeriesDetailMenuService } from '../../../../core/services/menu/asset-series-detail-menu.service';
import { TableHelper } from '../../../../core/helpers/table-helper';
import { AssetSeries } from '../../../../core/store/asset-series/asset-series.model';
import { environment } from '../../../../../environments/environment';
import { UploadDownloadService } from '../../../../shared/services/upload-download.service';

@Component({
  selector: 'app-asset-series-list',
  templateUrl: './asset-series-list.component.html',
  styleUrls: ['./asset-series-list.component.scss'],
  providers: [ConfirmationService]
})
export class AssetSeriesListComponent implements OnInit {

  assetSeriesMapping:
    { [k: string]: string } = { '=0': 'No asset series', '=1': '# Asset series', other: '# Asset series' };

  rowsPerPageOptions: number[] = TableHelper.rowsPerPageOptions;
  rowCount = TableHelper.defaultRowCount;

  isLoading$: Observable<boolean>;
  activeListItem: AssetSeriesDetails;

  assetSeries$: Observable<AssetSeriesDetails[]>;
  assetSeries: AssetSeriesDetails[];
  displayedAssetSeries: AssetSeriesDetails[];
  assetSeriesSearchedByName: AssetSeriesDetails[];
  menuType: ItemOptionsMenuType[];

  ItemOptionsMenuType = ItemOptionsMenuType;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private companyQuery: CompanyQuery,
    private assetSeriesService: AssetSeriesService,
    private assetSeriesDetailsQuery: AssetSeriesDetailsQuery,
    private assetSeriesDetailsResolver: AssetSeriesDetailsResolver,
    private assetTypeTemplatesResolver: AssetTypeTemplatesResolver,
    private unitsResolver: UnitsResolver,
    private dialogService: DialogService,
    private assetSeriesDetailMenuService: AssetSeriesDetailMenuService,
    private confirmationService: ConfirmationService,
    private uploadDownloadService: UploadDownloadService
  ) {
  }

  ngOnInit() {
    this.resolveAssetSeriesDetails();
    this.assetSeries$ = this.assetSeriesDetailsQuery.selectAll();
    this.assetTypeTemplatesResolver.resolve().subscribe();
    this.unitsResolver.resolve().subscribe();
    this.assetSeries$.subscribe(assetSeries => {
      this.assetSeries = this.displayedAssetSeries = this.assetSeriesSearchedByName = assetSeries;
    });

    this.rowCount = TableHelper.getValidRowCountFromUrl(this.rowCount, this.activatedRoute.snapshot, this.router);
    this.menuType = [ItemOptionsMenuType.CREATE, ItemOptionsMenuType.EDIT, ItemOptionsMenuType.DELETE,
      ItemOptionsMenuType.DOWNLOAD1, ItemOptionsMenuType.DOWNLOAD2];
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

  createAssetFromAssetSeries(assetSeriesId: ID) {
    this.assetSeriesDetailMenuService.showCreateAssetFromAssetSeries(assetSeriesId.toString(),
      () => this.resolveAssetSeriesDetails());
  }

  editAssetSeries(assetSeriesId: ID) {
    this.assetSeriesDetailMenuService.showEditWizard(assetSeriesId.toString(),
      () => this.resolveAssetSeriesDetails());
  }

  showDeleteDialog() {
    this.assetSeriesDetailMenuService.showDeleteDialog(this.confirmationService, 'asset-series-delete-dialog',
      this.activeListItem.name, () => this.deleteItem(this.activeListItem.id));
  }

  private resolveAssetSeriesDetails() {
    this.assetSeriesDetailsResolver.resolveFromComponent().subscribe();
  }

  private updateDisplayedAssetSeries() {
    this.displayedAssetSeries = this.assetSeries.filter(assetSerie => this.assetSeriesSearchedByName.includes(assetSerie));
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
    dynamicDialogRef.onClose.subscribe(() => this.resolveAssetSeriesDetails());
  }

  private deleteItem(id: ID) {
    this.assetSeriesService.deleteItem(this.activatedRoute.snapshot.params.companyId, id).subscribe();
  }

  updateRowCountInUrl(rowCount: number): void {
    TableHelper.updateRowCountInUrl(rowCount, this.router);
  }

  downloadAssetSeriesAsOwl(assetSeries: AssetSeries) {
    this.downloadAssetSeries(assetSeries, true);
  }

  downloadAssetSeriesAsJson(assetSeries: AssetSeries) {
    this.downloadAssetSeries(assetSeries, false);
  }

  private downloadAssetSeries(assetSeries: AssetSeries, asOwl: boolean) {
    const exportLink = this.assetSeriesService.getExportLink(assetSeries.id, assetSeries.companyId, asOwl);
    window.open(exportLink, '_blank');
  }

  onImportShacl(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', (event: Event) => {
      const file = (event.target as HTMLInputElement).files[0];
      const companyId = this.companyQuery.getActiveId();
      this.uploadDownloadService.uploadFile(`${environment.apiUrlPrefix}/fleet/${companyId}/shaclimport`, file, this);
      this.ngOnInit();

    });
    input.click();
  }

}
