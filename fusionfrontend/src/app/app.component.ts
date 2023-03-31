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

import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { akitaDevtools, enableAkitaProdMode } from '@datorama/akita';
import { environment } from '../environments/environment';
import { FactoryResolver } from './factory/services/factory-resolver.service';
import { AlertResolver } from './core/resolvers/alert.resolver';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { UserManagementService } from './core/services/api/user-management.service';
import { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(private alertResolver: AlertResolver,
              private factoryResolver: FactoryResolver,
              private userManagementService: UserManagementService,
              private ngZone: NgZone) { }
  factorySubTitle$: Subject<string>;
  keycloakUser$: Promise<KeycloakProfile>;

  private intervalHandle: number;
  private readonly FETCHING_INTERVAL_MILLISECONDS = environment.alertsUpdateIntervalMs;

  ngOnInit() {
    registerLocaleData(localeDe);
    this.factorySubTitle$ = this.factoryResolver.factorySubTitle$;
    this.keycloakUser$ = this.userManagementService.getUserProfile();
    if (environment.production) {
      enableAkitaProdMode();
    } else {
      akitaDevtools(this.ngZone);
    }

    this.periodicallyFetchAlerts();
  }

  private periodicallyFetchAlerts() {
    if (this.FETCHING_INTERVAL_MILLISECONDS > 0) {
      this.alertResolver.resolve().subscribe();
      this.intervalHandle = +setInterval(() => this.alertResolver.resolve().subscribe(),
        this.FETCHING_INTERVAL_MILLISECONDS);
    }
  }

  ngOnDestroy() {
    clearInterval(this.intervalHandle);
  }
}
