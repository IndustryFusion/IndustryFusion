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
import { ManagerType } from '../../../../core/models/manager-type.model';
import { UserManagementService } from '../../../../core/services/api/user-management.service';
import { KeycloakProfile } from 'keycloak-js';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { RouteHelpers } from '../../../../core/helpers/route-helpers';
import { AlertaQuery } from '../../../../core/store/ngsi-ld/alerta/alerta.query';
import { ID } from '@datorama/akita';
import { KeycloakService } from 'keycloak-angular';

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
  private companyId: ID;
  faUserCircle = faUserCircle;

  constructor(private routingLocation: Location,
              private alertaQuery: AlertaQuery,
              private userManagementService: UserManagementService,
              private keycloakService: KeycloakService,
              private router: Router) {
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

    this.companyId = (this.keycloakService.getKeycloakInstance().tokenParsed as any).IF_COMPANY;

    this.alertaQuery.selectOpenAlertCount().subscribe(openAlertCount => {
      this.openAlertCount = openAlertCount;
    });
  }

  isManager(manager: ManagerType) {
    return this.route && this.route.match(`\/${manager}\/`);
  }

  isDashboards() {
    return this.route && this.route.match(`\/${'dashboards'}\/`);
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
    if (this.companyId) {
      return this.router.navigate(['/notifications/companies', this.companyId, 'open']);
    }
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
      title = 'Factory Manager';
    } else if (this.isManager(ManagerType.FLEET_MANAGER)) {
      title = 'Fleet Manager';
    } else if (this.isManager(ManagerType.ECOSYSTEM_MANAGER)) {
      title = 'Ecosystem Manager';
    } else if (this.isDashboards()) {
      title = 'Dashboards';
    } else if (this.isNotifications()) {
      title = 'Notifications';
    } else if (this.isHome()) {
      title = 'Smart Factory';
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
