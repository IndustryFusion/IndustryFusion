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
import { CompanyQuery } from 'src/app/store/company/company.query';
import { FactorySite, FactorySiteWithAssetCount } from 'src/app/store/factory-site/factory-site.model';
import { FactorySiteQuery } from 'src/app/store/factory-site/factory-site.query';
import { FactoryComposedQuery } from 'src/app/store/composed/factory-composed.query';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FactorySiteDialogComponent } from '../factory-site-dialog/factory-site-dialog.component';
import { DialogType } from '../../../../common/models/dialog-type.model';
import { FactoryResolver } from '../../../services/factory-resolver.service';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from 'primeng/api';

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
    { [k: string]: string } = { '=0': 'No Factory sites', '=1': '# Factory site', other: '# Factory sites' };

  private ref: DynamicDialogRef;

  constructor(
    activatedRoute: ActivatedRoute,
    private factoryResolver: FactoryResolver,
    private companyQuery: CompanyQuery,
    private factorySiteQuery: FactorySiteQuery,
    private factoryComposedQuery: FactoryComposedQuery,
    public dialogService: DialogService,
    private confirmationService: ConfirmationService) {
    this.factoryResolver.resolve(activatedRoute);
  }

  ngOnInit() {
    this.isLoading$ = this.factorySiteQuery.selectLoading();
    this.companyId = this.companyQuery.getActiveId();
    this.factorySites$ = this.factoryComposedQuery.selectFactorySitesOfCompanyWithAssetCountInFactoryManager(this.companyId);
    this.factorySites$.subscribe(factorySites => {
      this.factorySites = this.displayedFactorySites = this.factorySitesSearchedByName =
        this.factorySitesSearchedByStreet = factorySites;
    });
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
      data: {
        type: DialogType.CREATE
      },
      header: `Create new Factory Site`,
      width: '70%',
      contentStyle: { 'padding-left': '6%', 'padding-right': '6%' },
    });
  }

  showEditDialog() {
    this.ref = this.dialogService.open(FactorySiteDialogComponent, {
      data: {
        factorySite: this.activeListItem,
        type: DialogType.EDIT
      },
      header: `Update Factory Site ${this.activeListItem.name}`,
      width: '70%',
      contentStyle: { 'padding-left': '4%', 'padding-right': '4%' },
    });
  }

  showDeleteDialog() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the Factory ' + this.activeListItem.name + '?',
      header: 'Delete Factory Confirmation',
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
    if (this.ref) {
      this.ref.close();
    }
  }

  setSelectedFactorySite(factoryId: ID) {
    this.selectedFactorySite = factoryId;
  }
}
