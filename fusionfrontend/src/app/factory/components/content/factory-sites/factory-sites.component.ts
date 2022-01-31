/*
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { CompanyQuery } from 'src/app/core/store/company/company.query';
import { FactorySite, FactorySiteWithAssetCount } from 'src/app/core/store/factory-site/factory-site.model';
import { FactorySiteQuery } from 'src/app/core/store/factory-site/factory-site.query';
import { FactoryComposedQuery } from 'src/app/core/store/composed/factory-composed.query';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FactorySiteDialogComponent } from '../factory-site-dialog/factory-site-dialog.component';
import { FactoryResolver } from '../../../services/factory-resolver.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { TableHelper } from '../../../../core/helpers/table-helper';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-factory-sites',
  templateUrl: './factory-sites.component.html',
  styleUrls: ['./factory-sites.component.scss'],
  providers: [DialogService, ConfirmationService]
})
export class FactorySitesComponent implements OnInit, OnDestroy {

  isLoading$: Observable<boolean>;
  companyId: ID;
  selectedFactorySite: ID;
  activeListItem: FactorySite;

  factorySites$: Observable<FactorySiteWithAssetCount[]>;
  factorySites: FactorySite[];
  displayedFactorySites: FactorySite[];
  factorySitesSearchedByName: FactorySite[];
  factorySitesSearchedByStreet: FactorySite[];

  factorySiteMapping:
    { [k: string]: string } = { '=0': this.translate.instant('APP.FACTORY.FACTORY_SITES.NO_FACTORY_SITES'),
    '=1': '# ' + this.translate.instant('APP.COMMON.TERMS.FACTORY_SITE'), other: '# ' +  this.translate.instant('APP.FACTORY.FACTORY_SITES.FACTORY_SITES') };

  rowsPerPageOptions: number[] = TableHelper.rowsPerPageOptions;
  rowCount = TableHelper.defaultRowCount;

  private ref: DynamicDialogRef;

  constructor(
    private factoryResolver: FactoryResolver,
    private companyQuery: CompanyQuery,
    private factorySiteQuery: FactorySiteQuery,
    private factoryComposedQuery: FactoryComposedQuery,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService) {
    this.factoryResolver.resolve(this.activatedRoute);
  }

  ngOnInit() {
    this.isLoading$ = this.factorySiteQuery.selectLoading();
    this.companyId = this.companyQuery.getActiveId();
    this.factorySites$ = this.factoryComposedQuery.selectFactorySitesOfCompanyWithAssetCountInFactoryManager(this.companyId);
    this.factorySites$.subscribe(factorySites => {
      this.factorySites = this.displayedFactorySites = this.factorySitesSearchedByName =
        this.factorySitesSearchedByStreet = factorySites;
    });

    this.rowCount = TableHelper.getValidRowCountFromUrl(this.rowCount, this.activatedRoute.snapshot, this.router);
  }

  setActiveRow(factorySite?) {
    this.activeListItem = factorySite;
  }

  searchFactorySitesByName(event: FactorySite[]) {
    this.factorySitesSearchedByName = event;
    this.updateDisplayedFactorySites();
  }

  searchFactorySitesByStreet(event: FactorySite[]) {
    this.factorySitesSearchedByStreet = event;
    this.updateDisplayedFactorySites();
  }

  updateDisplayedFactorySites() {
    this.displayedFactorySites = this.factorySites;
    const factorySitesIdsSearchedByStreet = this.factorySitesSearchedByStreet.map(factorySite => factorySite.id);
    this.displayedFactorySites = this.factorySitesSearchedByName.filter(factorySite =>
      factorySitesIdsSearchedByStreet.includes(factorySite.id));
  }

  showCreateDialog() {
    this.ref = this.dialogService.open(FactorySiteDialogComponent, {
      data: { },
      header: this.translate.instant('APP.FACTORY.FACTORY_SITES.DIALOG_HEADING.CREATE'),
      width: '70%',
      contentStyle: { 'padding-left': '6%', 'padding-right': '6%' },
    });
  }

  showEditDialog() {
    this.ref = this.dialogService.open(FactorySiteDialogComponent, {
      data: {
        factorySite: this.activeListItem,
      },
      header: this.translate.instant('APP.FACTORY.FACTORY_SITES.DIALOG_HEADING.UPDATE') + ` ${this.activeListItem.name}`,
      width: '70%',
      contentStyle: { 'padding-left': '4%', 'padding-right': '4%' },
    });
  }

  showDeleteDialog() {
    this.confirmationService.confirm({
      message: this.translate.instant('APP.FACTORY.FACTORY_SITES.CONFIRMATION_DIALOG.MESSAGE', { itemToDelete: this.activeListItem.name}),
      header: this.translate.instant('APP.FACTORY.FACTORY_SITES.CONFIRMATION_DIALOG.HEADER'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteFactorySite();
      },
      reject: () => {
      }
    });
  }

  deleteFactorySite() {
  }

  ngOnDestroy() {
    this.ref?.close();
  }

  setSelectedFactorySite(factoryId: ID) {
    this.selectedFactorySite = factoryId;
  }

  updateRowCountInUrl(rowCount: number): void {
    TableHelper.updateRowCountInUrl(rowCount, this.router);
  }
}
