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

import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ID } from '@datorama/akita';
import { CompanyQuery } from 'src/app/core/store/company/company.query';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RouteHelpers } from '../../../../core/helpers/route-helpers';
import { IfApiService } from '../../../../core/services/api/if-api.service';

@Component({
  selector: 'app-factory-sub-header',
  templateUrl: './factory-sub-header.component.html',
  styleUrls: ['./factory-sub-header.component.scss']
})
export class FactorySubHeaderComponent implements OnInit, OnDestroy {
  route: string;
  companyId: ID;
  private unSubscribe$ = new Subject<void>();
  private readonly URL_PREFIX = '^/factorymanager/companies/[0-9]+/';

  constructor(private location: Location,
              private router: Router,
              private companyQuery: CompanyQuery,
              public ifApiService: IfApiService) {
  }

  ngOnInit() {
    this.checkUrl();
    this.router.events
      .pipe(
        takeUntil(this.unSubscribe$)
      ).subscribe(() => {
      this.checkUrl();
      this.companyId = this.companyQuery.getActiveId();
    });
  }

  checkUrl(): void {
    if (this.location.path() !== '') {
      this.route = this.location.path();
    } else {
      this.route = '/';
    }
  }

  isFactoriesActive(): boolean {
    return RouteHelpers.matchFullRoutes(this.route,
      ['factorysites', 'factorysites/[0-9]+', 'factorysites/[0-9]+/asset-cards/[0-9,]+'],
           this.URL_PREFIX);
  }

  isRoomsActive(): boolean {
    return RouteHelpers.matchFullRoutes(this.route, ['rooms', 'rooms/[0-9]+', 'rooms/[0-9]+/asset-cards/[0-9,]+'], this.URL_PREFIX);
  }

  isAssetsActive = () => {
    return RouteHelpers.matchFullRoutes(this.route, ['assets$', 'assets/asset-cards/[0-9,]+', 'assets/status/[0-9]'], this.URL_PREFIX);
  }

  onFactoriesClick() {
    const companyId = this.route.split('/')[3];
    if (companyId) {
      return this.router.navigate(['/factorymanager/companies', companyId]);
    }
  }

  onRoomsClick() {
    const companyId = this.route.split('/')[3];
    if (companyId) {
      return this.router.navigate(['/factorymanager/companies', companyId, 'rooms']);
    }
  }

  onAssetsClick() {
    const companyId = this.route.split('/')[3];
    if (companyId) {
      return this.router.navigate(['/factorymanager/companies', companyId, 'assets']);
    }
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  onZipFileUpload(event: any): void {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const selectedZipFile: File = fileList[0];
      this.ifApiService.importEcosystemManagerDataToFactoryManager(this.companyId, selectedZipFile).subscribe();
    }
  }
}
