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
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-sub-header',
  templateUrl: './dashboard-sub-header.component.html',
  styleUrls: ['./dashboard-sub-header.component.scss']
})
export class DashboardSubHeaderComponent implements OnInit, OnDestroy {

  
  private unSubscribe$ = new Subject<void>();

  route: string;

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
  }

  isMaintenanceActive = () => {
    return this.route && this.route.match('^\/dashboards\/maintenance+$');
  }

  isEquipmentEfficiencyActive = () => {
    return this.route && this.route.match('^\/dashboards\/equipment+$');
  }

  isDashboard3Active = () => {
    return false;
  }

  onMaintenanceClick() {
    return this.router.navigate(['/dashboards/maintenance']);
  }

  onEquipmentEfficiencyClick() {
    return this.router.navigate(['/dashboards/equipmentEfficiency']);
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

}
