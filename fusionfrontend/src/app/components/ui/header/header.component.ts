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
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from 'src/app/store/user/user.model';
import { ManagerType } from '../../content/manager-type/manager-type.enum';
import { OispAlertQuery } from '../../../store/oisp-alert/oisp-alert.query';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private unSubscribe$ = new Subject<void>();

  @Input()
  factorySubTitle$: Subject<string>;
  @Input()
  ecoSystemManagerSubTitle$: Subject<string>;
  @Input()
  user: User;

  route: string;
  show: boolean;

  openAlertCount = 0;
  ManagerType = ManagerType;

  constructor(private routingLocation: Location,
              private oispAlertQuery: OispAlertQuery,
              private router: Router) { }

  ngOnInit() {
    this.show = true;
    this.router.events
    .pipe(
      takeUntil(this.unSubscribe$)
    ).subscribe(() => {
      if (this.routingLocation.path() !== '') {
        this.route = this.routingLocation.path();
      } else {
        this.route = '/';
      }
    });

    this.oispAlertQuery.selectOpenAlertCount().subscribe(openAlertCount => {
      this.openAlertCount = openAlertCount;
    } );
  }

  isManager(manager: ManagerType) {
    return this.route && this.route.match(`\/${manager}\/`);
  }

  isDashboards() {
    return this.route && this.route.match(`\/${'dashboards'}\/`);
  }

  isFusionApplet() {
    return this.route && this.route.match(`\/${'fusion-applets\/'}`);
  }

  isHome() {
    return this.route && this.route.match('/home');
  }

  onHomeClick() {
    return this.router.navigate(['/home']);
  }

  onBackClick() {
    return this.routingLocation.back();
  }

  onNotificationsClick() {
    return this.router.navigate(['/notifications']);
  }

  isNotifications() {
    return this.route && this.route.match(`\/${'notifications'}\/`);
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }
}
