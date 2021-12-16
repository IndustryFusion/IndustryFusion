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
import { ManagerType } from '../../content/manager-type/manager-type.enum';
import { OispAlertQuery } from '../../../../core/store/oisp/oisp-alert/oisp-alert.query';
import { UserManagementService } from '../../../../core/services/api/user-management.service';
import { KeycloakProfile } from 'keycloak-js';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { RouteHelpers } from '../../../../core/helpers/route-helpers';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input()
  factorySubTitle$: Subject<string>;
  @Input()
  user: KeycloakProfile;
  route: string;
  show: boolean;

  openAlertCount = 0;
  ManagerType = ManagerType;
  private unSubscribe$ = new Subject<void>();
  faUserCircle = faUserCircle;

  constructor(private routingLocation: Location,
              private oispAlertQuery: OispAlertQuery,
              private userManagementService: UserManagementService,
              private router: Router,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.show = true;
    this.router.events
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(() => {
        if (this.routingLocation.path() !== '') {
          this.route = this.routingLocation.path();
        } else {
          this.route = '/';
        }
      });

    this.oispAlertQuery.selectOpenAlertCount().subscribe(openAlertCount => {
      this.openAlertCount = openAlertCount;
    });
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

  isNotifications(): boolean {
    return this.route && RouteHelpers.matchRouteAllowPostfix(this.route, `\/notifications\/`) &&
      !RouteHelpers.matchRouteAllowPostfix(this.route, 'assets\/[0-9]*\/notifications\/');
  }

  isAssetDetails(): boolean {
    return this.route && RouteHelpers.matchRouteAllowPostfix(this.route, `\/assets\/[0-9]*`) &&
      !RouteHelpers.matchRouteAllowPostfix(this.route, '\/assets\/asset-cards/*') &&
      !RouteHelpers.matchRouteAllowPostfix(this.route, '\/assets\/status/');
  }

  isAssetSerieDetails() {
    return RouteHelpers.matchRoutesAllowPostfix(this.route, [`\/assetseries\/[0-9]*`]) && !this.isAssetSerieAssetDetails();
  }

  isAssetSerieAssetDetails() {
    return RouteHelpers.matchRoutesAllowPostfix(this.route, [`\/assetseries\/[0-9]*\/assets\/[0-9]*`]);
  }

  getPageTitle() {
    let title = '';
    if (this.isManager(ManagerType.FACTORY_MANAGER)) {
      title = this.translate.instant('APP.SHARED.UI.HEADER.PAGE_TITLE.FACTORY_MANAGER');
    } else if (this.isManager(ManagerType.FLEET_MANAGER)) {
      title = this.translate.instant('APP.SHARED.UI.HEADER.PAGE_TITLE.FLEET_MANAGER');
    } else if (this.isManager(ManagerType.ECOSYSTEM_MANAGER)) {
      title = this.translate.instant('APP.SHARED.UI.HEADER.PAGE_TITLE.ECOSYSTEM_MANAGER');
    } else if (this.isFusionApplet()) {
      title = this.translate.instant('APP.SHARED.UI.HEADER.PAGE_TITLE.APPLETS');
    } else if (this.isDashboards()) {
      title = this.translate.instant('APP.SHARED.UI.HEADER.PAGE_TITLE.DASHBOARDS');
    } else if (this.isNotifications()) {
      title = this.translate.instant('APP.SHARED.UI.HEADER.PAGE_TITLE.NOTIFICATIONS');
    } else if (this.isHome()) {
      title = this.translate.instant('APP.SHARED.UI.HEADER.PAGE_TITLE.SMART_FACTORY');
    }
    return title;
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  logoutUser() {
    this.userManagementService.logoutCurrentUser().catch(r => console.warn('logout not successful (', r, ')'));
  }

  navigateToKeycloakAdmin() {
    this.userManagementService.navigateToAdminConsoleInNewTab();
  }
}
