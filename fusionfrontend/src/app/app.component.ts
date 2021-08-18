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

import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { UserQuery } from './store/user/user.query';
import { User } from './store/user/user.model';
import { akitaDevtools } from '@datorama/akita';
import { enableAkitaProdMode } from '@datorama/akita';
import { environment } from '../environments/environment';
import { FactoryResolver } from './factory/services/factory-resolver.service';
import { EcoSystemManagerResolver } from './ecosystem/services/ecosystem-resolver.service';
import { OispAlertResolver } from './resolvers/oisp-alert-resolver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(private ecoSystemManagerResolver: EcoSystemManagerResolver,
              private oispAlertResolver: OispAlertResolver,
              private factoryResolver: FactoryResolver,
              private userQuery: UserQuery,
              private ngZone: NgZone) { }
  loggedUser$: Observable<User>;
  factorySubTitle$: Observable<string>;
  ecoSystemManagerSubTitle$: Observable<string>;

  private intervalHandle: number;
  private readonly FETCHING_INTERVAL_MILLISECONDS = environment.alertFetchingIntervalSec * 1000;

  private static fetchOpenNotificationCount(oispAlertResolver: OispAlertResolver) {
    oispAlertResolver.resolve().subscribe();
  }

  ngOnInit() {
    this.factorySubTitle$ = this.factoryResolver.factorySubTitle$;
    this.ecoSystemManagerSubTitle$ = this.ecoSystemManagerResolver.ecoSystemManagerSubTitle$;
    this.loggedUser$ = this.userQuery.selectActive();
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
