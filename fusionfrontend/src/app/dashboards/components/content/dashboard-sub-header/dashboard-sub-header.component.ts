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
import { Router, UrlTree } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ID } from '@datorama/akita';

@Component({
  selector: 'app-dashboard-sub-header',
  templateUrl: './dashboard-sub-header.component.html',
  styleUrls: ['./dashboard-sub-header.component.scss']
})
export class DashboardSubHeaderComponent implements OnInit, OnDestroy {

  private unSubscribe$ = new Subject<void>();

  route: string;
  companyId: ID = null;

  constructor(private location: Location, private router: Router) { }

  ngOnInit() {
    this.checkUrl();
    this.router.events
      .pipe(
        takeUntil(this.unSubscribe$)
      ).subscribe(() => {
        this.checkUrl();
      });
  }

  checkUrl(): void {
    if (this.location.path() !== '') {
      this.route = this.location.path();
    } else {
      this.route = '/';
    }
    this.companyId = this.route.split('/')[3];
  }

  isMaintenanceActive = () => {
    return this.route && this.route.match('^\/dashboards\/companies\/[0-9]\/maintenance+$');
  }

  isEquipmentEfficiencyActive = () => {
    return this.route && this.route.match('^\/dashboards\/companies\/[0-9]\/equipmentEfficiency+$');
  }

  isDashboard3Active = () => {
    return false;
  }

  onMaintenanceClick(): Promise<boolean> {
    if (this.companyId) {
      return this.router.navigateByUrl(this.getUrlTree('maintenance'));
    }
    return null;
  }

  onEquipmentEfficiencyClick(): Promise<boolean> {
    if (this.companyId) {
      return this.router.navigateByUrl(this.getUrlTree('equipmentEfficiency'));
    }
    return null;
  }

  private getUrlTree(subroute: string): UrlTree {
    return this.router.createUrlTree(['/dashboards/companies', this.companyId, subroute]);
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

}
