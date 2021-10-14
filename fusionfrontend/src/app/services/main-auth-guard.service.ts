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
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';
import { Role } from './roles.model';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class MainAuthGuard extends KeycloakAuthGuard implements CanActivate {
  constructor(
    protected readonly router: Router,
    protected readonly location: Location,
    protected readonly keycloak: KeycloakService
  ) {
    super(router, keycloak);
  }

  public async isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    // Force the user to log in if currently unauthenticated.
    if (!this.authenticated) {
      await this.keycloak.login({
        redirectUri: window.location.origin + this.location.prepareExternalUrl(state.url),
      });
    }

    // Get the roles required from the route.
    const requiredRoles: Array<Role> = route.data.roles;

    // Allow the user to to proceed if no additional roles are required to access the route.
    if (!(requiredRoles instanceof Array) || requiredRoles.length === 0) {
      return Promise.resolve(true);
    }

    // Allow the user to proceed if any of the required roles are present.
    return Promise.resolve(requiredRoles.some((role) => this.roles.includes(Role[role])));
  }
}
