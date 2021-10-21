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


import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  constructor(protected readonly router: Router,
              protected readonly keycloakService: KeycloakService) {
  }

  public getOispAccountId(): string {
    const token = (this.keycloakService.getKeycloakInstance().tokenParsed as any);
    let oispAccountId = '';

    if (token.accounts && token.accounts.length > 0) {
      oispAccountId = token.accounts[0].id;
    } else {
      console.warn('cannot retrieve OISP accountId, subsequent calls to OISP will hence most likely fail!');
    }

    return oispAccountId;
  }

  public logoutCurrentUser(): Promise<void> {
    return this.keycloakService.logout();
  }

  public getUserProfile(): Promise<KeycloakProfile> {
    return this.keycloakService.loadUserProfile();
  }

  public navigateToAdminConsoleInNewTab(): void {
    const url = environment.keycloakConfig.url + 'realms/OISP/account';
    window.open(url, '_blank');
  }
}
