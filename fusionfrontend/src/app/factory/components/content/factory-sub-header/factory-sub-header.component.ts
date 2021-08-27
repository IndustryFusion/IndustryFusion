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
import { CompanyQuery } from 'src/app/store/company/company.query';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-factory-sub-header',
  templateUrl: './factory-sub-header.component.html',
  styleUrls: ['./factory-sub-header.component.scss']
})
export class FactorySubHeaderComponent implements OnInit, OnDestroy {
  route: string;
  companyId: ID;
  private unSubscribe$ = new Subject<void>();

  constructor(private location: Location, private router: Router, private companyQuery: CompanyQuery) {
  }

  ngOnInit() {
    this.checkUrl();
    this.router.events
      .pipe(
        takeUntil(this.unSubscribe$)
      ).subscribe(() => {
      this.checkUrl();
    });
    this.companyId = this.companyQuery.getActiveId();
  }

  checkUrl(): void {
    if (this.location.path() !== '') {
      this.route = this.location.path();
    } else {
      this.route = '/';
    }
  }

  isFactoriesActive = () => {
    return this.route && this.route.match('^\/factorymanager\/companies\/[0-9]+$');
  }

  isAssetsActive = () => {
    return this.route && (
      this.route.match('^/factorymanager/companies/[0-9]+/factorysites/[0-9]+$') ||
      this.route.match('^/factorymanager/companies/[0-9]+/asset-cards/[0-9,]+$') ||
      this.route.match('^/factorymanager/companies/[0-9]+/factorysites/[0-9]+/asset-cards/[0-9,]+$') ||
      this.route.match('^/factorymanager/companies/[0-9]+/assets$') ||

      this.route.match('^/factorymanager/companies/[0-9]+/assets/rooms/[0-9]+') ||
      this.route.match('^/factorymanager/companies/[0-9]+/assets/rooms/[0-9]+/assets$\'') ||
      this.route.match('^/factorymanager/companies/[0-9]+/assets/rooms/[0-9]+/asset-cards/[0-9,]+$') ||
      this.route.match('^/factorymanager/companies/[0-9]+/assets/rooms/[0-9]+/asset-cards/[0-9,]+$') ||
      this.route.match('^/factorymanager/companies/[0-9]+/assets/rooms/[0-9]+/assets/[0-9]+$') ||
      this.route.match('^/factorymanager/companies/[0-9]+/assets/rooms/[0-9]+/assets/[0-9]+/details$') ||

      this.route.match('^/factorymanager/companies/[0-9]+/factorysites/[0-9]+$') ||
      this.route.match('^/factorymanager/companies/[0-9]+/factorysites/[0-9]+/rooms/[0-9]+$') ||
      this.route.match('^/factorymanager/companies/[0-9]+/factorysites/[0-9]+/rooms/[0-9]+/assets$') ||
      this.route.match('^/factorymanager/companies/[0-9]+/factorysites/[0-9]+/rooms/[0-9]+/asset-cards/[0-9,]+$') ||
      this.route.match('^/factorymanager/companies/[0-9]+/factorysites/[0-9]+/rooms/[0-9]+/assets/[0-9]+$') ||
      this.route.match('^/factorymanager/companies/[0-9]+/factorysites/[0-9]+/rooms/[0-9]+/assets/[0-9]+/details$')
    );
  }

  isSettingsActive = () => {
    return false;
  }

  onFactoriesClick() {
    const companyId = this.route.split('/')[3];
    if (companyId) {
      return this.router.navigate(['/factorymanager/companies', companyId]);
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
}
