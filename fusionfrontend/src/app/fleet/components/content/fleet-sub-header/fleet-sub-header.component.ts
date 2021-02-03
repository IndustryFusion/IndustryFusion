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
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { Router, UrlTree } from '@angular/router';
import { CompanyQuery } from '../../../../store/company/company.query';
import { ID } from '@datorama/akita';

@Component({
  selector: 'app-fleet-sub-header',
  templateUrl: './fleet-sub-header.component.html',
  styleUrls: ['./fleet-sub-header.component.scss']
})
export class FleetSubHeaderComponent implements OnInit, OnDestroy {
  private unSubscribe$ = new Subject<void>();

  route: string;
  companyId: ID;
  sub: Subscription;

  constructor(private location: Location, private router: Router, private companyQuery: CompanyQuery) { }

  ngOnInit() {
    this.sub = this.router.events
      .pipe(
        takeUntil(this.unSubscribe$)
      ).subscribe(() => {
        if (this.location.path() !== '') {
          this.route = this.location.path();
        } else {
          this.route = '/';
        }
      });
    this.companyId = this.companyQuery.getActiveId();
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  onRouteClick(subroute: string) : Promise<boolean> {
      if (this.companyId) {
        return this.router.navigateByUrl(this.getUrlTree(subroute));
      } else {
        return null;
      }
  }

  isRouteActive(subroute: string): boolean {
    if (this.companyId) {
      const urlTree = this.getUrlTree(subroute);
      return this.router.isActive(urlTree, false);
    }else {
      return false;
    }
  }

  private getUrlTree(subroute: string): UrlTree {
    return this.router.createUrlTree(['/fleetmanager/companies', this.companyId, subroute]);
  }
}
