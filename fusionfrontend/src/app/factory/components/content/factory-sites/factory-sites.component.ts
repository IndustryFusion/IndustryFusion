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

import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { CompanyQuery } from 'src/app/store/company/company.query';
import { FactorySiteWithAssetCount } from 'src/app/store/factory-site/factory-site.model';
import { FactorySiteQuery } from 'src/app/store/factory-site/factory-site.query';
import { FactoryComposedQuery } from 'src/app/store/composed/factory-composed.query';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FactorySiteDialogComponent } from '../factory-site-dialog/factory-site-dialog.component';
import { DialogType } from '../../../../common/models/dialog-type.model';

@Component({
  selector: 'app-factory-sites',
  templateUrl: './factory-sites.component.html',
  styleUrls: ['./factory-sites.component.scss'],
  providers: [DialogService]
})
export class FactorySitesComponent implements OnInit, OnDestroy {

  @Output()
  createFactorySiteEvent = new EventEmitter<FactorySite>();

  @Output()
  updateFactorySiteEvent = new EventEmitter<FactorySite>();

  isLoading$: Observable<boolean>;
  companyId: ID;
  factorySites$: Observable<FactorySiteWithAssetCount[]>;
  factorySiteMapping:
    { [k: string]: string } = { '=0': 'No factories', '=1': '# Factory site', other: '# Factory sites' };
  sortField: string;
  sortType: string;

  factorySite: FactorySite;
  factorySiteForm: FormGroup;
  ref: DynamicDialogRef;


  constructor(
    private companyQuery: CompanyQuery,
    private factorySiteQuery: FactorySiteQuery,
    private factoryComposedQuery: FactoryComposedQuery,
    private formBuilder: FormBuilder,
    public dialogService: DialogService) { }

  ngOnInit() {
    this.isLoading$ = this.factorySiteQuery.selectLoading();
    this.companyId = this.companyQuery.getActiveId();
    this.factorySites$ = this.factoryComposedQuery.selectFactorySitesOfCompanyWithAssetCount(this.companyId);
    this.createFactorySiteForm(this.formBuilder);
  }

  onSort(field: [string, string]) {
    this.sortField = field[0];
    this.sortType = field[1];
  }

  showCreateDialog() {
    const ref = this.dialogService.open(FactorySiteDialogComponent, {
      data: {
        factorySiteForm: this.factorySiteForm,
        type: DialogType.CREATE
      },
      header: `Create new Factory Site`,
      width: '70%',
      contentStyle: { 'padding-left': '6%', 'padding-right': '6%' },
    });

    ref.onClose.subscribe((factorySite: FactorySite) => {
      this.onCloseCreateDialog(factorySite);
      this.createFactorySiteForm(this.formBuilder);
      this.factorySite = new FactorySite();
    });
  }

  createFactorySiteForm(formBuilder: FormBuilder) {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    this.factorySiteForm = formBuilder.group({
      id: [null],
      name: ['', requiredTextValidator],
      line1: [''],
      line2: [''],
      city: ['', requiredTextValidator],
      zip: [''],
      country: ['', requiredTextValidator],
      type: [null, requiredTextValidator]
    });
  }

  onCloseCreateDialog(factorySite: FactorySite) {
    if (factorySite) {
      factorySite.companyId = this.companyId;
      this.factorySiteCreated(factorySite);
    }
  }

  factorySiteCreated(factorySite: FactorySite): void {
    this.createFactorySiteEvent.emit(factorySite);
  }

  factorySiteUpdated(factorySite: FactorySite): void {
    this.updateFactorySiteEvent.emit(factorySite);
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
