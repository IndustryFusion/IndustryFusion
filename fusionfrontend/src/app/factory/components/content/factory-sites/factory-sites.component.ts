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

@Component({
  selector: 'app-factory-sites',
  templateUrl: './factory-sites.component.html',
  styleUrls: ['./factory-sites.component.scss'],
  providers: [DialogService]
})
export class FactorySitesComponent implements OnInit, OnDestroy {

  isLoading$: Observable<boolean>;
  companyId: ID;
  factorySites$: Observable<FactorySiteWithAssetCount[]>;
  factorySiteMapping:
    { [k: string]: string } = { '=0': 'No Factory sites', '=1': '# Factory site', other: '# Factory sites' };
  sortField: string;
  sortType: string;

  factorySite: FactorySite;
  ref: DynamicDialogRef;

  constructor(
    private factoryResolver: FactoryResolver,
    activatedRoute: ActivatedRoute,
    private companyQuery: CompanyQuery,
    private factorySiteQuery: FactorySiteQuery,
    private factoryComposedQuery: FactoryComposedQuery,
    public dialogService: DialogService) {

    this.factoryResolver.resolve(activatedRoute);
  }

  ngOnInit() {
    this.isLoading$ = this.factorySiteQuery.selectLoading();
    this.companyId = this.companyQuery.getActiveId();
    this.factorySites$ = this.factoryComposedQuery.selectFactorySitesOfCompanyWithAssetCountInFactoryManager(this.companyId);
  }

  onSort(field: [string, string]) {
    this.sortField = field[0];
    this.sortType = field[1];
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

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
