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
import { Observable, Subject } from 'rxjs';
import { Company } from 'src/app/store/company/company.model';
import { CompanyQuery } from 'src/app/store/company/company.query';
import { ID } from '@datorama/akita';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { ActivatedRoute } from '@angular/router';
import { FactorySiteService } from 'src/app/store/factory-site/factory-site.service';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { FactorySiteQuery } from 'src/app/store/factory-site/factory-site.query';
import { takeUntil } from 'rxjs/operators';
import { RoomService } from '../../../../store/room/room.service';

@Component({
  selector: 'app-company-page',
  templateUrl: './company-page.component.html',
  styleUrls: ['./company-page.component.scss']
})
export class CompanyPageComponent implements OnInit, OnDestroy {

  isLoading$: Observable<boolean>;
  company$: Observable<Company>;
  factorySites: FactorySite[];
  companyId: ID;
  selectedFactorySite: ID;
  private unSubscribe$ = new Subject<void>();

  constructor(
    private companyQuery: CompanyQuery,
    private factoryResolver: FactoryResolver,
    private factorySiteService: FactorySiteService,
    private factorySiteQuery: FactorySiteQuery,
    private roomService: RoomService,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.isLoading$ = this.companyQuery.selectLoading();
    this.factoryResolver.resolve(this.activatedRoute);
    this.company$ = this.companyQuery.selectActive();
    this.companyId = this.companyQuery.getActiveId();
    this.factorySiteQuery.selectFactorySitesOfCompany(this.companyId)
      .pipe(
        takeUntil(this.unSubscribe$)
      ).subscribe(
      res => {
        this.factorySites = res;
      });
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  setSelectedFactorySite(id: ID) {
    this.selectedFactorySite = id;
  }

  factorySiteCreated(factorySite: FactorySite) {
    const createFactorySite$ = this.factorySiteService.createFactorySite(factorySite);
    createFactorySite$.subscribe(
      newFactorySite => {
        console.log('[company page] created factory site: ' + newFactorySite?.name);
        this.roomService.getRoomsOfFactorySite(this.companyId, newFactorySite.id).subscribe();
      },
      error => console.log(error)
    );
  }

  factorySiteUpdated(factorySite: FactorySite) {
    const createFactorySite$ = this.factorySiteService.updateFactorySite(factorySite);
    createFactorySite$.subscribe(
      res => {
        console.log('[company page] updated factory site: ' + res.name);
      },
      error => console.log(error)
    );
  }
}
