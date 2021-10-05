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

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { DatePipe, Location } from '@angular/common';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LaunchpadPageComponent } from './components/pages/launchpad-page/launchpad-page.component';
import { LaunchpadItemComponent } from './components/content/launchpad-item/launchpad-item.component';
import { HeaderComponent } from './components/ui/header/header.component';
import { FactoryModule } from './factory/factory.module';
import { FleetModule } from './fleet/fleet.module';
import { EcosystemModule } from './ecosystem/ecosystem.module';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { environment } from 'src/environments/environment';
import { TokenInterceptor } from './services/token.interceptor';
import { DashboardModule } from './dashboards/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { IFCommon } from './common/i-f-common.module';
import { FusionAppletsModule } from './fusion-applets/fusion-applets.module';
import { ErrorInterceptor } from './services/error.interceptor';
import { ToastModule } from 'primeng/toast';
import { PageTitleComponent } from './components/content/page-title/page-title.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LaunchpadPageComponent,
    LaunchpadItemComponent,
    PageTitleComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    IFCommon,
    FactoryModule,
    FleetModule,
    EcosystemModule,
    DashboardModule,
    FusionAppletsModule,
    NotificationsModule,
    AkitaNgRouterStoreModule,
    ClarityModule,
    BrowserAnimationsModule,
    KeycloakAngularModule,
    ToastModule,
  ],
  bootstrap: [AppComponent],
  providers: [
    DatePipe,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService, Location],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ]
})
export class AppModule {
}

function initializeKeycloak(keycloak: KeycloakService, location: Location) {
  return () =>
    keycloak.init({
      config: environment.keycloakConfig,
      initOptions: {
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        silentCheckSsoRedirectUri:
          window.location.origin + location.prepareExternalUrl('/assets/silent-check-sso.html'),
      },
      enableBearerInterceptor: false,
    });
}
