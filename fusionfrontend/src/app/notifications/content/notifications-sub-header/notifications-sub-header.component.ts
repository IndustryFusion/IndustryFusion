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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RouteHelpers } from '../../../core/helpers/route-helpers';
import { CompanyQuery } from '../../../core/store/company/company.query';
import { ID } from '@datorama/akita';

@Component({
  selector: 'app-notifications-sub-header',
  templateUrl: './notifications-sub-header.component.html',
  styleUrls: ['./notifications-sub-header.component.scss']
})
export class NotificationsSubHeaderComponent implements OnInit, OnDestroy {

  private unSubscribe$ = new Subject<void>();
  private companyId: ID;

  route: string;

  constructor(private location: Location,
              private router: Router,
              private companyQuery: CompanyQuery) { }

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

  isOpenActive = () => {
    return RouteHelpers.matchFullRoutes(this.route, ['^\/notifications\/companies\/[0-9]*\/open+']);
  }

  isClearedActive = () => {
    return RouteHelpers.matchFullRoutes(this.route, ['^\/notifications\/companies\/[0-9]*\/cleared+']);
  }

  onOpenClick() {
    return this.router.navigate([`/notifications/companies/${this.companyId}/open`]);
  }

  onClearedClick() {
    return this.router.navigate([`/notifications/companies/${this.companyId}/cleared`]);
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

}
