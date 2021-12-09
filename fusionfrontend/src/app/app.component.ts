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
import { OispAlertResolver } from './core/resolvers/oisp-alert-resolver';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { UserManagementService } from './core/services/api/user-management.service';
import { KeycloakProfile } from 'keycloak-js';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(private oispAlertResolver: OispAlertResolver,
              private factoryResolver: FactoryResolver,
              private userManagementService: UserManagementService,
              private ngZone: NgZone,
              private translateService: TranslateService) {
    this.translateService.addLangs(['en', 'ger']);
    // this language will be used as a fallback when a translation isn't found in the current language
    this.translateService.setDefaultLang('en');
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    // const browserLang = translate.getBrowserLang();
    // translateService.use(browserLang.match(/en|ger/) ? browserLang : 'en');
    this.translateService.use(localStorage.getItem('lang' || 'en'));
  }
  factorySubTitle$: Subject<string>;
  keycloakUser$: Promise<KeycloakProfile>;

  private intervalHandle: number;
  private readonly FETCHING_INTERVAL_MILLISECONDS = environment.alertsUpdateIntervalMs;

  private static fetchOpenNotificationCount(oispAlertResolver: OispAlertResolver) {
    oispAlertResolver.resolve().subscribe();
  }

  ngOnInit() {
    registerLocaleData(localeDe);
    this.factorySubTitle$ = this.factoryResolver.factorySubTitle$;
    this.keycloakUser$ = this.userManagementService.getUserProfile();
    if (environment.production) {
      enableAkitaProdMode();
    } else {
      akitaDevtools(this.ngZone);
    }

    this.periodicallyFetchOpenAlertCount();
  }

  private periodicallyFetchOpenAlertCount() {
    if (this.FETCHING_INTERVAL_MILLISECONDS > 0) {
      AppComponent.fetchOpenNotificationCount(this.oispAlertResolver);
      this.intervalHandle = setInterval(() => AppComponent.fetchOpenNotificationCount(this.oispAlertResolver),
        this.FETCHING_INTERVAL_MILLISECONDS);
    }
  }

  ngOnDestroy() {
    clearInterval(this.intervalHandle);
  }
}
